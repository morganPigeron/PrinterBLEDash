/// <reference types="web-bluetooth" />

import { Injectable } from '@angular/core';

import { from, of } from 'rxjs';
import { delay } from 'rxjs/internal/operators';
import { concatMap } from 'rxjs/internal/operators';


/**
 * service : 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * characteristic : beb5483e-36e1-4688-b7f5-ea07361b26a8
 */

@Injectable({
  providedIn: 'root'
})
export class BlePrinterService {

  private device?: Promise<BluetoothDevice>;
  private server?: Promise<BluetoothRemoteGATTServer>;
  private service?: Promise<BluetoothRemoteGATTService>;
  private characteristic?: Promise<BluetoothRemoteGATTCharacteristic>;

  private SERVICE_UUID = "81c44919-afbc-49bf-b418-c2640cd1955e";
  private CHARACTERISTIC_UUID = "49937b28-0ac3-4bd8-b7a7-c86af70fc559";

  public initBle() {
    this.device = navigator.bluetooth.requestDevice({
      //acceptAllDevices:true//,
      filters: [{
        namePrefix: 'PrinterBle',
      }],
      optionalServices: [
        this.SERVICE_UUID,
      ],
    });
    if (!this.device) throw new Error("cannot init webBle");

    this.server = this.device.then(device => {
      if (!device.gatt) throw new Error("No gatt available");
      return device.gatt.connect();
    });
    if (!this.server) throw new Error("Cant connect to Gatt");

    this.service = this.server.then(server => server.getPrimaryService(this.SERVICE_UUID));
    if (!this.service) throw new Error("Cant get Service");

    this.characteristic = this.service.then(service => service.getCharacteristic(this.CHARACTERISTIC_UUID));
    if (!this.characteristic) throw new Error("Cant get Characteristic");
  }

  public getDevice() {
    return this.device;
  }

  public writeToPrinter(buffer: ArrayBuffer) {
    if (!this.characteristic) throw new Error("Cant get Characteristic"); 
    let lines:ArrayBuffer[] = []
    const lineNumber = Math.ceil(buffer.byteLength / 32);

    for (let i = 0; i < lineNumber; i++) {
      if(i === lineNumber-1) {
        lines.push(buffer.slice(i*32));
      }
      else {
        lines.push(buffer.slice(i*32,i*32+32));
      }
    }
    
    from(lines).pipe(concatMap(line => of(line).pipe( delay(500))))
        .subscribe(timedLine => {
          this.characteristic?.then(characteristic => characteristic.writeValue(timedLine).catch(console.error));
        });
  }
}
