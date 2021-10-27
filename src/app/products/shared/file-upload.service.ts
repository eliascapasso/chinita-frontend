import { Injectable } from "@angular/core";
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from "angularfire2/storage";
import { Observable } from "rxjs";

@Injectable()
export class FileUploadService {
  public task$: AngularFireUploadTask;

  // Progress monitoring
  public percentage$: Observable<number>;

  public snapshot: Observable<any>;

  // Download URL
  public downloadURL: Observable<string>;

  constructor(public storage: AngularFireStorage) {}

  public async startUpload(data) {
    // The Files objects
    const files = data.files;
    var downloadURLArr: any[] = [];

    // Client-side validation example
    for (let file of files) {
      if (file.type.split("/")[0] !== "image") {
        console.error("unsupported file type :( ");
        throw new Error("upload failed, unsupported file type");
      }

      // The storage path
      const path = `product-images/${new Date().getTime()}_${file}`;

      // The main task
      this.task$ = this.storage.upload(path, file);

      // the percentage
      this.percentage$ = this.task$.percentageChanges();

      var task = await this.task$;
      downloadURLArr.push(this.storage.ref(task.ref.fullPath));
    }

    var result = {
      task: task,
      downloadURLArr: downloadURLArr,
    };

    return result;
  }

  public async uploadSharedFile(data: { type: any; file: any }) {
    // The storage path
    const path = `shared/${data.type}`;

    // The main task
    this.task$ = this.storage.upload(path, data.file);

    // the percentage
    this.percentage$ = this.task$.percentageChanges();

    var task = await this.task$;

    var result = {
      task: task,
      downloadURL: this.storage.ref(task.ref.fullPath).getDownloadURL(),
    };
    return result;
  }

  public deleteFile(files: string[]) {
    if (files) {
      return files.map((filePath) => {
        return this.storage.ref(filePath).delete();
      });
    }
  }

  // Determines if the upload task is active
  public isActive(snapshot) {
    return (
      snapshot.state === "running" &&
      snapshot.bytesTransferred < snapshot.totalBytes
    );
  }
}
