import * as fs from 'fs'
import * as url from 'url'
import sharp from 'sharp';

import { errorPage } from './404-page.js';


export const assetHandler = async(req,res,ext)=>{


    if(req.method === 'GET'){

        var urlPath = decodeURI(req.requrl.pathname);

        let image;
        let imageFilePath;
        let imageRequestedSize;
        let imageSizeRegex = /[-][0-9]+[x][0-9]+/;
        
        let checkImageSizeRegex = urlPath.match(imageSizeRegex);

        if(checkImageSizeRegex){
            imageFilePath = process.cwd() + checkImageSizeRegex.input.replace(checkImageSizeRegex[0],'')
            imageRequestedSize = {
                width:parseInt(checkImageSizeRegex[0].replace('-','').split('x')[0]),
                height:parseInt(checkImageSizeRegex[0].replace('-','').split('x')[1])
            }
        }
        else{
            imageFilePath = process.cwd() + urlPath
        }

        if(fs.existsSync(imageFilePath)){
            image = fs.readFileSync(imageFilePath);

            if(imageRequestedSize && (imageRequestedSize.height > 0 || imageRequestedSize.width > 0)){
                let imageOriginalSize = await sharp(image).metadata();

                if(imageOriginalSize.width < imageRequestedSize.width || imageOriginalSize.height < imageRequestedSize.height){

                    let redirectUrl = encodeURI(urlPath.replace(checkImageSizeRegex[0],''));
                    
                    res.writeHead(302,{
                        'Location':redirectUrl
                    })
                    res.end();
                    return;
                }
                else{
                    image = await sharp(image)
                    .webp({
                        quality:80,
                        progressive:true,
                        chromaSubsampling: '4:4:4',
                    })
                    .resize({
                        height:imageRequestedSize.height,
                        width:imageRequestedSize.width,
                        fit:'fill'
                    })
                    .toBuffer()
                }
            }
            else{
                image = await sharp(image)
                .webp({
                    quality:80,
                    progressive:true,
                    chromaSubsampling: '4:4:4',
                })
                .toBuffer()
            }

            res.statusCode = 200;
            res.setHeader("Content-Type",`image/webp`)
            res.write(image,"utf8");
            res.end();
            
        }
        else{
            return errorPage(req,res);
        }
    }
    else{
        return errorPage(req,res);
    }
}