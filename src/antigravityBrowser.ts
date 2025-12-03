import { Antigravity } from "./antigravityStub.ts";

export const antigravity = new Antigravity({
    // configuration options; set headless to false for visible browser
    headless: false,
});

export const openBrowser = async (url: string = "/") => {
    await antigravity.launch({ url });
};
