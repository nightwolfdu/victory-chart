/* eslint no-unused-expressions: 0 */
import syncAxis from "src/helpers/axissync";

describe("helpers/axissync", () => {
  describe("sync", () => {
    it("return expected tick count, based on size of domain labels width", () => {
      expect(
        syncAxis(
          [[124.123122222222, 3523], [124.123122222222, 3523]],
          {},
          { orientation: "bottom", width: 200 }
        )[0].length
      ).to.be.eql(1);
    });
    it("return expected tick count, based on size of domain labels height", () => {
      expect(
        syncAxis(
          [[1.00000000000000000000001, 3], [1.00000000000000000000001, 3]],
          { fontSize: 20 },
          { orientation: "left", height: 200 }
        )[0].length
      ).to.be.eql(11);
    });
    it("return syncronized ticks with same ticks count", () => {
      const syncedAxises = syncAxis(
        [[2, 8], [3, 12]],
        {},
        { orientation: "left", height: 100 }
      );
      expect(syncedAxises[0].length).to.be.eql(7);
      expect(syncedAxises[1].length).to.be.eql(7);
    });
    it("return expected ticks", () => {
      const syncedAxises = syncAxis(
        [[1, 15], [-1000, 4000]],
        {},
        { orientation: "left", height: 100 }
      );
      expect(syncedAxises[0]).to.be.eql([2, 4, 6, 8, 10, 12, 14]);
      expect(syncedAxises[1]).to.be.eql([-1000, 0, 1000, 2000, 3000, 4000, 5000]);
    });
  });
});
