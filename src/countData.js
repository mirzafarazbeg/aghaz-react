import alphabetData from "./alphabetData";
import colorData from "./colorData";
import countData from "./countData";

const mapLettersAndWords = (items) =>
  items.map(({ letter, words = [] }) => ({
    letter,
    words: words
      .filter((entry) => typeof entry?.word === "string")
      .map(({ word }) => word),
  }));

const lettersAndWords = {
  alphabet: mapLettersAndWords(alphabetData),
  colors: mapLettersAndWords(colorData),
  counts: mapLettersAndWords(countData),
};

export default lettersAndWords;
