import { TestBed } from '@angular/core/testing';

import { BlePrinterService } from './ble-printer.service';

describe('BlePrinterService', () => {
  let service: BlePrinterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlePrinterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
