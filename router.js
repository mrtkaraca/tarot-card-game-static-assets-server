import * as url from "url"
import * as fs from "fs"
import { errorPage } from "./controller/404-page.js"
import { assetHandler } from "./controller/asset-handler.js";


const mimes = [
    {
      path:'png',
      contentType:'image/png'
    },
    {
      path:'jpg',
      contentType:'image/jpg'
    },
    {
      path:'avif',
      contentType:'image/avif'
    }
]

const findMimes = (path)=>{
    let rg;
    for(let i = 0;i< mimes.length;i++){
        rg = new RegExp(`.(${mimes[i].path})$`);
        if(rg.test(path)){
            return mimes[i];
        }
    }
    return false;
};

export const getRouter = function(req, res) {

    req.requrl = url.parse(req.url, true);
    var path = decodeURI(req.requrl.pathname);

    var ext = findMimes(path);

    if(ext){
        return assetHandler(req,res,ext) 
    }
    else{
        return errorPage(req,res);
    }
}