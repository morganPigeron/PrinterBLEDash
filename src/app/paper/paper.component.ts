import { Component, Input } from '@angular/core';
import { of } from 'rxjs';
import { debounceTime, delay } from 'rxjs/internal/operators';
import { BlePrinterService } from '../services/printer/ble-printer.service';


@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class PaperComponent {
  
  public isPrinterConnected = false;
  public isBusy = false;
  public totalPrint = 0;
  public progressPrint = 0;

  public isConnectChecked = false;
  public isConnectDisabled = false;
  

  public buffer: string = "";

  constructor(private printer: BlePrinterService) {
    this.printer.isConnected.subscribe(state => this.isPrinterConnected = state);
    this.printer.disconnectInfo.subscribe(time => {
      this.isConnectChecked = false; 
      console.info(`disconnected at : ${new Date(time)}`);
    });
    this.printer.isPrinting.subscribe(state => this.isBusy = state);
    this.printer.isLoading.subscribe(state => this.isConnectDisabled = state);
    this.printer.progressPrinting.subscribe(progress => this.progressPrint = progress);
  }

  public mainCheck() {
    this.isConnectChecked ? this.printer.connect() : this.printer.disconnect();
  }

  public sendToPrinter() {
    if(this.buffer.length === 0) return;
    this.printer.writeToPrinter(this.buffer);
    this.totalPrint = this.printer.getNumberOfPrint();
  }

  public debugBuffer() { console.info(`buffer = ${this.buffer} len = ${this.buffer.length}`) }

}
