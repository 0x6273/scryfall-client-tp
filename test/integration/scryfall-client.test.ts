"use strict";

import client = require("../../src/");
import fixtures from "Fixtures";
import Card from "Models/card";
import List from "Models/list";
import Set from "Models/set";

jest.setTimeout(90000);

const fakeCard = fixtures.card;

const budokaGardener = "49999b95-5e62-414c-b975-4191b9c1ab39";
const windfall = "357cf802-2d66-49a4-bf43-ab3bc30ab825";
const docentOfPerfection = "30c3d4c1-dc3d-4529-9d6e-8c16149cf6da";
const brunaFadingLight = "27907985-b5f6-4098-ab43-15a0c2bf94d5";
const brisela = "5a7a212e-e0b6-4f12-a95c-173cae023f93";
const beastialMenace = "73c16134-692d-4fd1-bffa-f9342113cbd8";
const originalProsh = "fc411c52-3ee2-4fe4-983d-3fa43b516237";

describe("scryfallClient", function () {
  describe("get", function () {
    it("makes a request to scryfall", function () {
      return client.get("cards/random").then((card) => {
        expect(card.object).toBe("card");
      });
    });

    it("handles errors", function () {
      return expect(client.get("foo")).rejects.toMatchObject({
        message: expect.any(String),
        status: 404,
      });
    });

    it("can send query params", function () {
      return client
        .get("cards/search", {
          q: "Budoka Gardener c:g",
        })
        .then((list) => {
          expect(list[0].object).toBe("card");
        });
    });

    describe("List object", function () {
      it("can get the next page of results", function () {
        return client
          .get("cards/search", {
            q: "set:rix",
          })
          .then((list) => {
            expect(list.object).toBe("list");

            return list.next();
          })
          .then((list) => {
            expect(list.object).toBe("list");
          });
      });

      it("can recursively call next", function () {
        let totalCards: number;

        function collectCards(
          list: List,
          allCards: Card[] = []
        ): Promise<List | Card[]> {
          allCards.push(...list);

          if (!list.has_more) {
            return Promise.resolve(allCards);
          }

          return list.next().then(function (newList) {
            return collectCards(newList, allCards);
          });
        }

        return client
          .get("cards/search", {
            q: "format:standard r:r",
          })
          .then(function (list) {
            totalCards = list.total_cards;

            return collectCards(list);
          })
          .then(function (allRareCardsInStandard: Card[]) {
            expect(allRareCardsInStandard.length).toBe(totalCards);
          });
      });
    });

    describe("Set object", function () {
      it("can get cards from set", function () {
        return client
          .get("sets/dom")
          .then((set: Set) => {
            expect(set.object).toBe("set");

            return set.getCards();
          })
          .then((list) => {
            expect(list.object).toBe("list");
            expect(list[0].object).toBe("card");
          });
      });
    });

    describe("Card object", function () {
      it("can get rulings for card", function () {
        return client
          .get(`cards/${budokaGardener}`)
          .then((card) => {
            return card.getRulings();
          })
          .then((rulings) => {
            expect(rulings.object).toBe("list");
            expect(rulings[0].object).toBe("ruling");
          });
      });

      it("can get set object for card", function () {
        return client
          .get(`cards/${budokaGardener}`)
          .then((card) => {
            return card.getSet();
          })
          .then((set: Set) => {
            expect(set.object).toBe("set");
          });
      });

      it("can get prints for card", function () {
        return client
          .get(`cards/${windfall}`)
          .then((card) => {
            return card.getPrints();
          })
          .then((prints) => {
            expect(prints.object).toBe("list");
            expect(prints.length).toBeGreaterThan(1);
          });
      });

      it("can check legality of a card", function () {
        return client
          .get("cards/search", {
            q: "format:standard r:r",
          })
          .then((list) => {
            const card = list[0];

            expect(card.isLegal("standard")).toBe(true);
            expect(card.isLegal("pauper")).toBe(false);
          });
      });

      describe("card images", function () {
        it("can get the image of a card", function () {
          let id: string;

          return client.get(`cards/${windfall}`).then((card) => {
            id = card.id;

            const image = card.getImage();
            expect(typeof image).toBe("string");
            expect(image).toEqual(expect.stringContaining("img.scryfall.com"));
            expect(image).toEqual(expect.stringContaining(id));
          });
        });

        it("can get the image of a transform card", function () {
          let id: string;

          return client.get(`cards/${docentOfPerfection}`).then((card) => {
            id = card.id;

            const image = card.getImage();
            expect(typeof image).toBe("string");
            expect(image).toEqual(expect.stringContaining("img.scryfall.com"));
            expect(image).toEqual(expect.stringContaining(id));
          });
        });

        it("can get the image of a meld card", function () {
          let id: string;

          return client.get(`cards/${brunaFadingLight}`).then((card) => {
            id = card.id;

            const image = card.getImage();
            expect(typeof image).toBe("string");
            expect(image).toEqual(expect.stringContaining("img.scryfall.com"));
            expect(image).toEqual(expect.stringContaining(id));
          });
        });

        it("can get the image of a melded card", function () {
          let id: string;

          return client.get(`cards/${brisela}`).then((card) => {
            id = card.id;

            const image = card.getImage();
            expect(typeof image).toBe("string");
            expect(image).toEqual(expect.stringContaining("img.scryfall.com"));
            expect(image).toEqual(expect.stringContaining(id));
          });
        });

        it("can get the backside image of a normal card (missing url)", function () {
          return client.get(`cards/${windfall}`).then((card) => {
            const image = card.getBackImage();
            expect(image).toBe("https://img.scryfall.com/errors/missing.jpg");
          });
        });

        it("can get the backside image of a meld card (missing url)", function () {
          return client.get(`cards/${brunaFadingLight}`).then((card) => {
            const image = card.getBackImage();
            expect(image).toBe("https://img.scryfall.com/errors/missing.jpg");
          });
        });

        it("can get the backside image of a transform card", function () {
          let id: string;

          return client.get(`cards/${docentOfPerfection}`).then((card) => {
            id = card.id;

            const image = card.getBackImage();
            expect(image).toEqual(expect.stringContaining("img.scryfall.com"));
            expect(image).toEqual(expect.stringContaining(id));
          });
        });
      });

      it("can get price for a card", function () {
        return client.get(`cards/${beastialMenace}`).then((card) => {
          const price = Number(card.getPrice());

          expect(price).toBeGreaterThan(0);
        });
      });

      it("can get tokens for a card", function () {
        return client
          .get(`cards/${beastialMenace}`)
          .then((card) => {
            return card.getTokens();
          })
          .then((tokens: Card[]) => {
            expect(tokens.length).toBe(3);

            tokens.forEach((token) => {
              expect(token.layout).toBe("token");
            });
          });
      });

      it("can get tokens for a card where the print does not have tokens", function () {
        return client
          .get(`cards/${originalProsh}`)
          .then((card) => {
            return card.getTokens();
          })
          .then((tokens: Card[]) => {
            expect(tokens.length).toBe(1);
            expect(tokens[0].layout).toBe("token");
          });
      });
    });
  });

  describe("post", function () {
    it("can post to the collections endpoint", function () {
      return client
        .post("cards/collection", {
          identifiers: [
            {
              set: "c16",
              collector_number: "49",
            },
            {
              set: "zen",
              collector_number: "47",
            },
          ],
        })
        .then((cards) => {
          expect(cards[0].name).toBe("Vial Smasher the Fierce");
          expect(cards[1].name).toBe("Hedron Crab");
        });
    });
  });

  describe("getSymbolUrl", function () {
    it("returns the url for a character representing a symbol", function () {
      expect(client.getSymbolUrl("W")).toBe(
        "https://img.scryfall.com/symbology/W.svg"
      );
    });

    it("returns the url for symbol in curly braces", function () {
      expect(client.getSymbolUrl("{U}")).toBe(
        "https://img.scryfall.com/symbology/U.svg"
      );
    });
  });

  describe("wrap", function () {
    it("can wrap saved response object into scryfall response", function () {
      const card = client.wrap(fakeCard);

      expect(card).toBeInstanceOf(Card);
    });
  });

  describe("text transformations", function () {
    afterEach(() => {
      client.resetTextTransform();
    });

    it("can set custom text transform function", function () {
      client.setTextTransform((text: string) => {
        return text.toUpperCase();
      });

      return client.get(`cards/${windfall}`).then((card) => {
        expect(card.name).toBe("WINDFALL");
      });
    });

    it("can set text transform to slack emoji", function () {
      client.slackify();

      return client.get(`cards/${originalProsh}`).then((card) => {
        expect(card.mana_cost).toBe(":mana-3::mana-B::mana-R::mana-G:");
      });
    });

    it("can set text transform to discord emoji", function () {
      client.discordify();

      return client.get(`cards/${originalProsh}`).then((card) => {
        expect(card.mana_cost).toBe(":mana3::manaB::manaR::manaG:");
      });
    });
  });
});
