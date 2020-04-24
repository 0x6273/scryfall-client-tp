"use strict";

const wrapScryfallResponse = require("../../../lib/wrap-scryfall-response");
const List = require("../../../models/list");
const fixtures = require("../../fixtures");

describe("List", function () {
  let fakeRequestMethod, config;

  beforeEach(function () {
    fakeRequestMethod = jest.fn();
    config = {
      requestMethod: fakeRequestMethod,
    };
  });

  it("inherits from Array", function () {
    const list = new List(fixtures.listOfCards, config);

    expect(list).toBeInstanceOf(Array);
    expect(list).toBeInstanceOf(List);
  });

  it("its entries are defined by data properties", function () {
    const list = new List(fixtures.listOfCards, config);

    expect(typeof list[0].name).toBe("string");
    expect(list[0].name).toBe(fixtures.listOfCards.data[0].name);
    expect(typeof list[1].name).toBe("string");
    expect(list[1].name).toBe(fixtures.listOfCards.data[1].name);
  });

  it("responds to Array methods", function () {
    const list = new List(fixtures.listOfCards, config);

    expect(list.length).toBe(2);

    list.push({ foo: "bar" });
    expect(list.length).toBe(3);

    list.pop();
    expect(list.length).toBe(2);

    const names = list.map((entry) => entry.name);

    expect(names).toBeInstanceOf(Array);
    expect(names).not.toBeInstanceOf(List);
    expect(names[0]).toBe(fixtures.listOfCards.data[0].name);
    expect(names[1]).toBe(fixtures.listOfCards.data[1].name);
  });

  it("applies properties to object", function () {
    const list = new List(fixtures.listOfCards, config);

    expect(list.total_cards).toBeGreaterThan(0);
    expect(list.total_cards).toBe(fixtures.listOfCards.total_cards);
    expect(list.has_more).toBe(true);
    expect(list.has_more).toBe(fixtures.listOfCards.has_more);
  });

  it("does not apply data property to object", function () {
    const list = new List(fixtures.listOfCards, config);

    expect(list.data).toBeUndefined();
  });

  describe("next", function () {
    beforeEach(function () {
      fakeRequestMethod.mockResolvedValue(
        wrapScryfallResponse(fixtures.listOfCardsPage2, {
          requestMethod: fakeRequestMethod,
        })
      );
    });

    it("makes a request for the next page", function () {
      const list = new List(fixtures.listOfCards, config);

      return list.next().then((list2) => {
        expect(fakeRequestMethod).toBeCalledWith(
          fixtures.listOfCards.next_page
        );
        expect(list2[0].name).toBe(fixtures.listOfCardsPage2.data[0].name);
      });
    });

    it("rejects promise if there are no additional results", function () {
      const list = new List(fixtures.listOfCards, config);

      list.has_more = false;

      return expect(list.next()).rejects.toMatchObject({
        message: "No additional pages.",
      });
    });
  });
});
