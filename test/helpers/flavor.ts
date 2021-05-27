// indexOf returns -1 if value is not present
const tokenArgvIndex = process.argv.indexOf('--flavor');
const tokenArgv = process.argv[tokenArgvIndex + 1];
const defaultStandard = 'default';
const tokenStandard: string = (tokenArgvIndex == -1) ? defaultStandard : tokenArgv;

export default tokenStandard;
