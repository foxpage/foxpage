import shortid from 'shortid';

function getPass(len: number) {
  let tmpCh = '';
  for (let i = 0; i < len; i++) {
    tmpCh += String.fromCharCode(Math.floor(Math.random() * 26) + 'a'.charCodeAt(0));
  }
  return tmpCh;
}

const shortId = (len = 11) => getPass(len - 9) + shortid.generate();

export default shortId;
