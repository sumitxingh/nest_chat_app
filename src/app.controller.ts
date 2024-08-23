import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { basename, extname } from 'path';
import { format } from 'date-fns';
import * as process from 'node:process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello() {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      data: {
        timeZone: currentTimezone,
        currntTime: new Date(),
        processId: process.pid
      },
      meta: {
        message: 'Hello from ' + currentTimezone,
        type: 'getHelloResponseDto',
      }
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload', // Specify the destination directory
      filename: (req, file, cb) => {
        const fileExtName = extname(file.originalname); // Extract file extension
        const currentDate = format(new Date(), 'yyyyMMddhhmmss'); // Format the date as YYYYMMDD
        const newFileName = `Pic_${currentDate}${fileExtName}`; // Create new file name
        cb(null, newFileName);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      data: file,
      meta: {
        message: 'File uploaded successfully',
        type: 'uploadResponseDto',
      }
    };
  }
}
