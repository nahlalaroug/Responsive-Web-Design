import { TestBed } from '@angular/core/testing';

import { JdmService } from './jdm.service';

describe('JdmService', () => {
  let service: JdmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JdmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
