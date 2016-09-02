/* eslint no-unused-expressions: 0 */
import * as d3Scale from "d3-scale";
import * as d3 from "d3";
import SyncAxis from "src/helpers/axissync";

describe("helpers/axissync", () => {
  // console.log(d3Scale.scaleTime().domain([new Date(2010, 1, 1),
  //  new Date(2010, 2, 2)]).range([0, 400]).ticks(12));
  describe("sync", () => {
    it("return empty array with empty domains", () => {
      expect(SyncAxis.sync([])).to.be.empty;
    });
  });
  describe("getLongestString", () => {
    it("return expected string", () => {
      expect(SyncAxis.getLongestString([[124.12312, 3523], [121245, 23]])).to.be.eql("124.12312");
    });
  });
  describe("getTextSize", () => {
    it("return base font sizes without style", () => {
      const size = SyncAxis.getTextSize("123");
      expect(size.width.toFixed(2)).to.be.eql("20.76");
      expect(size.height.toFixed(2)).to.be.eql("14.49");
    });
  });
  describe("getExpectedLabelCount", () => {
    it("return expected label count", () => {
      const horizontalCount = SyncAxis.getExpectedLabelCount({width: 1, height: 1},
        {orientation: "bottom", width: 2.99, height: 3.1}
      );
      const verticalCount =
        SyncAxis.getExpectedLabelCount({width: 1, height: 1},
        {orientation: "left", width: 2.99, height: 3.1}
      );
      expect(horizontalCount).to.be.eql(2);
      expect(verticalCount).to.be.eql(3);
    });
  });
  describe("extendDomainByTicksAndInterval", () => {
    it("return expected ticks and interval", () => {
      expect(SyncAxis.getTicks([0.1, 10], 5).ticks).to.be.eql([2, 4, 6, 8, 10]);
    });
  });
  describe("syncTicks", () => {
    it("return syncronized ticks", () => {
      const syncronizedTicks = SyncAxis.syncTicks([
         {ticks: [2, 4, 6], tickInterval: 2},
         {ticks: [3, 6, 9, 12], tickInterval: 3}
      ]);
      expect(syncronizedTicks[0].ticks).to.be.eql([2, 4, 6, 8]);
      expect(syncronizedTicks[1].ticks).to.be.eql([3, 6, 9, 12]);
    });
  });
  describe("sync", () => {
    it("return expected ticks and interval", () => {
      const syncedAxises = SyncAxis.sync(
          [[1, 15], [-1000, 4000]],
          {},
          {orientation: "left", height: 100}
      );
      expect(syncedAxises[0].ticks).to.be.eql([2, 4, 6, 8, 10, 12, 14]);
      expect(syncedAxises[0].domain).to.be.eql([2, 14]);
      expect(syncedAxises[1].ticks).to.be.eql([-1000, 0, 1000, 2000, 3000, 4000, 5000]);
      expect(syncedAxises[1].domain).to.be.eql([-1000, 5000]);
    });
  });
});
