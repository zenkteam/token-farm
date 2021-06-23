// indexOf returns -1 if value is not present
const tokenArgvIndex = process.argv.indexOf('--flavor');
const tokenArgv = process.argv[tokenArgvIndex + 1];
const defaultFlavor = 'default';
const flavor: string = (tokenArgvIndex == -1) ? defaultFlavor : tokenArgv;

export default flavor;
