export function __assign(target, ...sources) {
  return Object.assign(target, ...sources);
}

export function __rest(source, excluded) {
  const result = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !excluded.includes(key)) {
      result[key] = source[key];
    }
  }
  return result;
}

export function __spreadArray(to, from, pack) {
  if (pack || (typeof to.push === "function" && from.length <= 0)) {
    return to.push(...from), to;
  }
  return [...to, ...from];
}

export function __awaiter(_this, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P((resolve) => resolve(value));
  }
  function fulfilled(value) {
    try { step(generator().next(value)); } catch (error) { reject(error); }
  }
  function rejected(value) {
    try { step(generator().throw(value)); } catch (error) { reject(error); }
  }
  function step(result) {
    result.done
      ? resolve(adopt(result.value))
      : adopt(result.value).then(fulfilled, rejected);
  }
  let resolve;
  let reject;
  const promise = new P((res, rej) => {
    resolve = res;
    reject = rej;
  });
  step(generator().next());
  return promise;
}
