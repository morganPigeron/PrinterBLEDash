/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';

import { from, Observable, of, pipe, Subject } from 'rxjs';
import { delay, takeLast, tap } from 'rxjs/internal/operators';
import { concatMap } from 'rxjs/internal/operators';



/**
 * service : 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * characteristic : beb5483e-36e1-4688-b7f5-ea07361b26a8
 */
@Injectable({
  providedIn: 'root'
})
export class BlePrinterService {

  private device?: BluetoothDevice;
  private characteristic?: BluetoothRemoteGATTCharacteristic;
  private totalPrint: number;

  public isConnected: Subject<boolean>;
  public disconnectInfo: Subject<number>;
  public isPrinting: Subject<boolean>;
  public isLoading: Subject<boolean>;
  public progressPrinting: Subject<number>;


  private readonly SERVICE_UUID = "81c44919-afbc-49bf-b418-c2640cd1955e";
  private readonly CHARACTERISTIC_UUID = "49937b28-0ac3-4bd8-b7a7-c86af70fc559";
  private readonly PRINTER_STATE_UUID = "fa6828e6-13a0-4308-abb9-baaff423aab9";
  private readonly MAXWIDTH = 32;
  private readonly OPTIONS = {
    filters: [{
      namePrefix: 'PrinterBle',
    }],
    optionalServices: [
      this.SERVICE_UUID,
    ],
  };

  constructor() {
    this.disconnectInfo = new Subject();
    this.isConnected = new Subject();
    this.isPrinting = new Subject();
    this.progressPrinting = new Subject();
    this.isLoading = new Subject();
    this.totalPrint = 0;
  }

  public getNumberOfPrint() {
    return this.totalPrint;
  }

  public disconnect() {
    this.isLoading.next(true);
    if (!this.device) return;
    if (this.device.gatt!.connected) {
      this.device.gatt!.disconnect();
    }
    this.isLoading.next(false);
  }

  public connect() {
    this.isLoading.next(true);
    if (!this.device) return this.initBle();

    console.log('Connect to GATT');
    this.device.gatt!.connect()
      .then(server => {
        console.log('Getting service');
        return server.getPrimaryService(this.SERVICE_UUID);
      })
      .then(service => {
        console.log('Getting Characteristic');
        return service.getCharacteristic(this.CHARACTERISTIC_UUID);
      })
      .then(characteristic => {
        this.characteristic = characteristic;
        this.isConnected.next(true);
        this.isLoading.next(false);
      })
      .catch(err => {
        console.error(err);
        this.isLoading.next(false); // release anyway
      });
  }

  private initBle() {
    //init
    console.log('Init BLE');
    navigator.bluetooth.requestDevice(this.OPTIONS)
      .then(device => {
        this.device = device;
        this.device.addEventListener("gattserverdisconnected", () => {
          this.disconnectInfo.next(Date.now());
          this.isConnected.next(false);
        });
        this.connect();
      });
  }

  public writeToPrinter(text: string) {

    //set printer busy
    let progress = 0;
    this.isPrinting.next(true);
    this.progressPrinting.next(progress);

    //always utf-8
    let enc = new TextEncoder();
    const buffer = enc.encode(text);

    //increment print counter
    this.totalPrint++;

    //break text in lines
    if (!this.characteristic) throw new Error("Cant get Characteristic");
    let lines: ArrayBuffer[] = []
    const lineNumber = Math.ceil(buffer.byteLength / this.MAXWIDTH);

    for (let i = 0; i < lineNumber; i++) {
      if (i === lineNumber - 1) {
        lines.push(buffer.slice(i * this.MAXWIDTH));
      }
      else {
        lines.push(buffer.slice(i * this.MAXWIDTH, i * this.MAXWIDTH + this.MAXWIDTH));
      }
    }

    //create delay between lines
    const source = from(lines).pipe(concatMap(line => of(line).pipe(delay(750))))

    //print lines
    source
      .pipe(concatMap(async timedLine => {
        try {
          await this.characteristic!.writeValue(timedLine);
          progress += 100 / lineNumber;
          this.progressPrinting.next(progress);
        } catch (message) {
          return console.error(message);
        }
      }))
      .pipe(takeLast(1)).subscribe(() => { //wait 2000 after last line to reset busy
        this.isPrinting.next(false);
        this.progressPrinting.next(100);
      });
  }
}
