import re


def build_body(db, campaign, template):

    if template is not None:
        body = template.content.replace("[CAMPAIGN CONTENT]", campaign.body)
    else:
        body = campaign.body

    # Manage blocks

    body = _manage_articles(body, db, "coucou")
    body = _manage_entities(body, db, "coucou2")
    body = _manage_logo(body, "coucou3")

    return body


def manage_unsubscription_link(body, user_id):
    return body


def _manage_articles(body, db, api_url):
    blocks = re.findall(r"\[ARTICLE\s\d+\]", body)

    for b in blocks:
        article_id = re.search(r"\d+", b).group()
        a = db.get(db.tables["Article"], {"id": article_id})

        if len(a) > 0:
            a = a[0]

            img = "<div class='no-image'/>" if a.image is None \
                else f"<img src='{api_url}public/get_public_image/{a.image}'/> ";

            body = body.replace(
                b,
                f"""<table class="article">
                    <tr>
                        <td class="image">
                            {img}
                        </td>
                        <td class="content">
                            <div class="type">{a.type}</div>
                            <div class="title">{a.title}</div>
                            <div class="abstract">{a.abstract}</div>
                            <button>Read more</button>
                        </td>
                    </tr>
                </table>"""
            )

    return body


def _manage_entities(body, db, api_url):
    blocks = re.findall(r"\[ENTITY\s\d+\]", body)

    for b in blocks:
        entity_id = re.search(r"\d+", b).group()
        e = db.get(db.tables["Entity"], {"id": entity_id})

        if len(e) > 0:
            e = e[0]

            img = "<div class='no-image'/>" if e.image is None \
                else f"<img src='{api_url}public/get_public_image/{e.image}'/> ";

            body = body.replace(
                b,
                f"""<table class="entity">
                        <tr>
                            <td class="image">
                                {img}
                            </td>
                            <td class="content">
                                <div class="name">{e.name}</div>
                                <button>Read more</button>
                            </td>
                        </tr>
                    </table>"""
            )

    return body


def _manage_logo(body, api_url):
    return body.replace(
        "[LOGO]",
        f"""
        <img
        style='max-width: 100%; max-height: 100%;'
        src='{api_url}public/get_public_image/logo.png'
        />
        """,
    )

