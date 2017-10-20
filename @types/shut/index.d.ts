
// add typeRoots = ["./nodemodules/shut/@types", "./nodemodules/@types"]
interface JQueryStatic {

    Sh: any;
    UiSh: any;
    Res: any;
    BodyLabel(key: string, options: any, fallback?: string): any;
}

interface Array<T> {
    remove(from, to?): T[];

}


interface String {
    toSentenceCase(): string;
    format(...items: string[]): string;
    isNullOrEmpty(): boolean;
    toBoolean(): boolean;
    toPrettyPrice(): string;
    toNormalNumber(): string;
    toPrettyNumber(): string;

}
declare var _debug: any;
