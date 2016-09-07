/* eslint no-unused-expressions: 0 */
import syncAxis from "src/helpers/axissync";

describe("helpers/axissync", () => {
  it("return expected tick count, based on size of domain labels width", () => {
    const res = syncAxis([
      { domain: [124.12312222, 3523], style: {}, width: 150, orientation: "bottom" },
      { domain: [124.12312222, 3523], style: {}, width: 150, orientation: "bottom" }]
    );
    expect(
      res[0].length
    ).to.be.eql(17);
  });
  it("return expected tick count, based on size of domain labels height", () => {
    expect(
      syncAxis([
        {
          domain: [1.00000000000000000000001, 3],
          style: { tickLabels: { fontSize: 20 } }, orientation: "left", height: 200
        },
        {
          domain: [1.00000000000000000000001, 3],
          style: { tickLabels: { fontSize: 20 } }, orientation: "left", height: 200
        }
      ])[0].length
    ).to.be.eql(11);
  });
  it("return syncronized ticks with same ticks count", () => {
    const syncedAxises = syncAxis(
      [
        {
          domain: [2, 8],
          style: {}, orientation: "left", height: 100
        },
        {
          domain: [3, 12],
          style: {}, orientation: "left", height: 100
        }
      ]
    );
    expect(syncedAxises[0].length).to.be.eql(7);
    expect(syncedAxises[1].length).to.be.eql(7);
  });
  it("return expected ticks", () => {
    const syncedAxises = syncAxis(
      [{
        domain: [1, 15],
        style: {}, orientation: "left", height: 100
      },
        {
          domain: [-1000, 4000],
          style: {}, orientation: "left", height: 100
        }
      ]
    );
    expect(syncedAxises[0]).to.be.eql([2, 4, 6, 8, 10, 12, 14]);
    expect(syncedAxises[1]).to.be.eql([-1000, 0, 1000, 2000, 3000, 4000, 5000]);
  });
  it("sync expected horizontal axis", () => {
    const syncedAxises = syncAxis(
      [{
        domain: [1, 15],
        style: {}, orientation: "bottom", width: 100
      },
        {
          domain: [-1000, 4000],
          style: {}, orientation: "top", width: 100
        },
        {
          domain: [-1000, 1000],
          style: {}, orientation: "left", height: 100
        }
      ]
    );
    expect(syncedAxises[0]).to.be.eql([5, 10, 15]);
    expect(syncedAxises[1]).to.be.eql([0, 2000, 4000]);
    expect(syncedAxises[2]).to.be.eql([-1000, -500, 0, 500, 1000]);
  });
  it("sync time axis", () => {
    const syncedAxises = syncAxis(
      [{
        domain: [new Date(2015, 1, 1), new Date(2016, 1, 1)],
        style: {}, orientation: "left", height: 100, scale: "time"
      },
        {
          domain: [new Date(2015, 1, 1), new Date(2017, 1, 1)],
          style: {}, orientation: "left", height: 100, scale: "time"
        }
      ]
    );
    expect(syncedAxises[0].map((time) => time.getTime())).to.be.eql(
      [1427835600000, 1432835600000, 1437835600000, 1442835600000,
       1447835600000, 1452835600000, 1457835600000, 1462835600000]);
    expect(syncedAxises[1].map((time) => time.getTime())).to.be.eql(
      [1427835600000, 1437835600000, 1447835600000, 1457835600000,
       1467835600000, 1477835600000, 1487835600000, 1497835600000]);
  });
});
