export default (page) => {
    return new URL(`./${page}`, import.meta.url).href
}