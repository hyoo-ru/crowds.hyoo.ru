namespace $ {
	export class $hyoo_crus_mine_pg extends $hyoo_crus_mine {
		
		@ $mol_memo.method
		static urn() {
			return $mol_state_arg.value( 'db' )
		}
		
		@ $mol_memo.method
		static url() {
			return new URL( this.urn()! )
		}
		
		@ $mol_mem_key
		static rock( hash: $hyoo_crus_link, next?: Uint8Array< ArrayBuffer > ): Uint8Array< ArrayBuffer > | null {
			if( next ) {
				$mol_wire_sync( this ).db_sync()?.query(
					`
						INSERT INTO Rock( hash, rock )
						VALUES( $1::text, $2::bytea )
						ON CONFLICT( hash ) DO NOTHING
					`,
					[ hash.str, next ]
				)
				return next
			}
			return $mol_wire_sync( this ).rock_load( hash )
		}
		
		static async rock_load( hash: $hyoo_crus_link ) {
			
			const db = await this.db()
			if( !db ) return null
			
			const res = await db.query(
				`SELECT rock FROM Rock WHERE hash = $1::text`,
				[ hash.str ]
			)
			
			return res.rows[0]?.rock as Uint8Array< ArrayBuffer > ?? null
		}
		
		static async units_save( land: $hyoo_crus_link, units: readonly $hyoo_crus_unit[] ) {
			
			const db = await this.db()
			if( !db ) return
			
			const tasks = units.map( unit => {
				const buf = Buffer.from( unit.buffer, unit.byteOffset, unit.byteLength )
				return db.query(
					`
						INSERT INTO Land( land, path, unit )
						VALUES( $1::text, $2::text, $3::bytea )
						ON CONFLICT( land, path ) DO UPDATE SET unit = $3::bytea;
					`,
					[ land.str, unit.key(), buf ]
				)
			} )
			
			await Promise.all( tasks )
			
			for( const unit of units ) this.units_persisted.add( unit )
			
		}
		
		@ $mol_action
		static async units_load( land: $hyoo_crus_link ) {
			
			const db = await this.db()
			if( !db ) return []

			const res = await db.query<{ unit: Uint8Array< ArrayBuffer > }>(
				`SELECT unit FROM Land WHERE land = $1::text`,
				[ land.str ]
			)
			
			const units = res.rows.map( ( row: any )=> {
				const unit = new $hyoo_crus_unit(
					row.unit.buffer as ArrayBuffer,
					row.unit.byteOffset,
					row.unit.byteLength,
				).narrow()
				this.units_persisted.add( unit )
				$hyoo_crus_unit_trusted.add( unit )
				return unit
			})
			
			return units
		}
		
		@ $mol_mem
		static db_sync() {
			$mol_wire_solid()
			return $mol_wire_sync( this ).db()
		}
		
		@ $mol_memo.method
		static async db() {
			
			const urn = this.urn()
			if( !urn ) return null
			
			const db = new $node.pg.Pool({
				connectionString: urn,
				ssl: { rejectUnauthorized: false },
			})
			
			db.on( 'error', ( error: any )=> {
				this.$.$mol_log3_fail({
					place: this,
					message: error?.message,
				})
			} )
			
			// await db.connect()
			
			await db.query(`
				CREATE TABLE IF NOT EXISTS Land (
					land text NOT NULL,
					path text NOT NULL,
					unit bytea NOT NULL,
					primary key( land, path )
				);
			`)
			
			await db.query(`
				CREATE TABLE IF NOT EXISTS Rock (
					hash text NOT NULL,
					rock bytea NOT NULL,
					primary key( hash )
				);
			`)
			
			this.$.$mol_log3_rise({
				place: this,
				message: 'Data Base Ready',
				type: this.url().protocol,
				host: this.url().host,
				name: this.url().pathname,
			})
			
			return db
		}
		
	}
}
