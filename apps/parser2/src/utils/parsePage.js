import { load } from "cheerio";
import { PageParsingError } from "../exceptions/PageParsingError";
const shgpu_domen = "https://shgpi.edu.ru/";
export const parsePage = async (page) => {
    try {
        const $ = load(page);
        const link = $(`body > section > div.container > 
       div > div.col-md-9.col-hd-9.slide_col_full >
       div > div.full-news > div > p:nth-child(5) > a`).attr("href");
        return shgpu_domen + link;
    }
    catch (error) {
        //TODO
        throw new PageParsingError();
    }
};
//# sourceMappingURL=parsePage.js.map