import React from "react";
import dompurify from "dompurify";
import Mermaid from "react-mermaid2";
import { getApiURL } from "./env.jsx";

export function getContentFromBlock(b) {
	let el = null;

	if (b.type === "TITLE1") {
		el = <h3>{b.content}</h3>;
	} else if (b.type === "TITLE2") {
		el = <h4>{b.content}</h4>;
	} else if (b.type === "TITLE3") {
		el = <h5>{b.content}</h5>;
	} else if (b.type === "PARAGRAPH") {
		el = <div dangerouslySetInnerHTML={{
			__html:
			dompurify.sanitize(b.content),
		}} />;
	} else if (b.type === "IMAGE") {
		if (b.content !== null) {
			el = <div className='content-media'>
				<img src={`${getApiURL()}public/get_public_image/${b.content}`}/>
			</div>;
		}
	} else if (b.type === "FRAME") {
		if (b.content !== null) {
			el = <div className='content-media'>
				<div dangerouslySetInnerHTML={
					{
						__html:
						b.content.replace("&lt;", "<").replace("&gt;", ">"),
					}
				} />
			</div>;
		}
	} else if (b.type === "MERMAID") {
		if (b.content !== null) {
			el = <Mermaid
				chart={b.content}
			/>;
		}
	}

	return el;
}

export function getNextTitle1Position(content, pos) {
	for (let i = pos + 1; i < content.length; i++) {
		if (content[i].type === "TITLE1") {
			return i + 1;
		}
	}

	return content.length;
}

export function getArticleStatus(article) {
	const status = [];

	if (article !== null) {
		if (article.status !== "PUBLIC") {
			status.push("The status of the article is not PUBLIC");
		}

		if (article.publication_date === null) {
			status.push("The publication date of the article is not defined");
		} else if (article.publication_date > new Date()) {
			status.push("The publication date of the article is in the future");
		}

		if (article.type === "EVENT") {
			if (article.start_date === null) {
				status.push("The start date of the article is not defined");
			}
			if (article.end_date === null) {
				status.push("The end date of the article is not defined");
			}
		}
	} else {
		return null;
	}

	return status;
}
