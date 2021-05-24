import { Component, OnInit } from '@angular/core';
import { BlePrinterService } from '../ble-printer.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class PaperComponent implements OnInit {
  
  private buffer: string = "";
  current = 'Start';
  textControl = new FormControl();
  constructor(private printer: BlePrinterService) { }

  ngOnInit(): void {

  }

  public findPrinter() {
    this.printer.initBle();
  }

  public getPrinterInfo() {
    this.printer.getDevice()?.then(console.info);
  }

  public sendToPrinter() {
    let enc = new TextEncoder(); // always utf-8
    console.info(`byteLength = ${enc.encode(this.buffer).byteLength}`);
    this.printer.writeToPrinter(enc.encode(this.buffer));
  }

  public updateBuffer(text: string) {
    console.info(`buffer = ${text} len = ${text.length}`);
    this.buffer = text;
  }

}
