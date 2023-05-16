export default function (htmlString: string) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString

  tempDiv.querySelectorAll('span').forEach((spanElmt) => {
    spanElmt.outerHTML = spanElmt.innerHTML
  })

  return tempDiv.innerHTML
}
