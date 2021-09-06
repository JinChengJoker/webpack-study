module.exports = cssStr => `
  if (document) {
    const styleElement = document.createElement('style')
    styleElement.innerHTML = ${JSON.stringify(cssStr)}
    document.head.appendChild(styleElement)
  }
`