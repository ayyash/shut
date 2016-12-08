
// add typeRoots = ["./nodemodules/shut/@types", "./nodemodules/@types"]
interface JQueryStatic {

    Sh: any;
    ShUi: any;
    Res: any;
    BodyLabel(key: string, options: any, fallback?: string): any;
}

interface Array<T> {
    remove(from, to?): T[];

}


interface String {
    toSentenceCase(): String;
    format(...items: string[]): String;
    isNullOrEmpty(): Boolean;
    toBoolean(): Boolean;
    toPrettyPrice(): String;
    toNormalNumber(): String;
    toPrettyNumber(): String;

}
declare var _debug: any;
