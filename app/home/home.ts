namespace $ {
	
	export class $hyoo_crus_app_home extends $hyoo_crus_home.with({
		Aliases: $hyoo_crus_dict_to( $hyoo_crus_list_str ),
		Stat: $hyoo_crus_atom_link_to( ()=> $hyoo_crus_app_stat ),
	}) {
		
		stat( auto?: any ) {
			return this.Stat( auto )?.ensure( this.land() ) ?? null
		}
		
		init() {}
		tick() {}
		
	}
	
}
