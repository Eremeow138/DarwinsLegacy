import { TestBed } from "@angular/core/testing";

import { EmojisCheckParamGuard } from "./emojis-check-param.guard";

describe("EmojisCheckParamGuard", () => {
  let guard: EmojisCheckParamGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EmojisCheckParamGuard);
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });
});
