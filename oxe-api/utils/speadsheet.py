import re


def clean_html(raw_html):
    if not isinstance(raw_html, str):
        return None

    raw_html = raw_html.replace("</p>", "\n").replace("&nbsp;", "")
    return re.sub(re.compile('<.*?>'), "", raw_html)
