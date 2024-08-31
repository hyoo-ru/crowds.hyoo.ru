namespace $ {
	
	export class $hyoo_crus_app_stat extends $hyoo_crus_dict.with({
		
		/** User time in secs */
		Cpu_user: $hyoo_crus_stat_ranges,
		/** System time in secs */
		Cpu_system: $hyoo_crus_stat_ranges,
		
		/** Memory in MB */
		Mem_used: $hyoo_crus_stat_ranges,
		/** FS used */
		Fs_used: $hyoo_crus_stat_ranges,
		
		/** FS read count */
		Fs_reads: $hyoo_crus_stat_ranges,
		/** FS write count */
		Fs_writes: $hyoo_crus_stat_ranges,
		
		/** Slave sockets count */
		Port_slaves: $hyoo_crus_stat_ranges,
		/** Masters sockets count */
		Port_masters: $hyoo_crus_stat_ranges,
		
	}) {
		
		@ $mol_mem
		tick() {
			
			this.$.$mol_state_time.now( 1000 )
			
			const res = process.resourceUsage()
			this.Cpu_user( null )!.tick_integral( res.userCPUTime / 1e6 ) // s
			this.Cpu_system( null )!.tick_integral( res.systemCPUTime / 1e6 ) // s
			this.Fs_reads( null )!.tick_integral( res.fsRead ) // pct
			this.Fs_writes( null )!.tick_integral( res.fsWrite ) // pct
			
			const mem_total = process.constrainedMemory() ?? $node.os.totalmem()
			this.Mem_used( null )!.tick_instant( ( res.maxRSS - res.sharedMemorySize ) * 1024 / mem_total * 100 ) // %
			
			// const fs = $node.fs.statfsSync( '.' )
			// this.Fs_used( null )!.tick_instant( ( Number( fs.blocks ) - Number( fs.bfree ) ) / Number( fs.blocks ) * 100 ) // %
			
			const slaves = this.$.$hyoo_crus_glob.yard().slaves.size
			this.Port_slaves( null )!.tick_instant( slaves ) // pct
			
			// const masters = this.$.$hyoo_crus_glob.yard().masters().length
			// this.Port_masters( null )!.tick_instant( masters ) // pct
			
		}
		
	}
	
}