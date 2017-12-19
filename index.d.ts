export = Matcher;
declare function Matcher(input: string[], patterns: string[]) : string[];

declare namespace Matcher{
    export function isMatch(input: string, pattern: string) : boolean;
}
