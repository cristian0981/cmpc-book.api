import { existsSync } from 'fs';
import { join } from 'path';

import { Injectable, BadRequestException } from '@nestjs/common';


@Injectable()
export class FilesService {
  
    getStaticBookImage( bookName: string ) {

        const path = join( __dirname, '../../uploads/books', bookName );

        if ( !existsSync(path) ) 
            throw new BadRequestException(`No book found with image ${ bookName }`);

        return path;
    }


}