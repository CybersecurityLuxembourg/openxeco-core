import React, { Component } from "react";
import "./ArticleHorizontal.css";
import dompurify from "dompurify";
import NoImage from "../box/NoImage.jsx";
import { getApiURL } from "../../utils/env.jsx";
import Chip from "../form/Chip.jsx";
import ArticleStatus from "./ArticleStatus.jsx";
import { dateToString } from "../../utils/date.jsx";
import { getArticleStatus } from "../../utils/article.jsx";
import DialogArticleEditor from "../dialog/DialogArticleEditor.jsx";

export default class ArticleHorizontal extends Component {
	constructor(props) {
		super(props);

		this.getEntityTagsContent = this.getEntityTagsContent.bind(this);

		this.state = {
		};
	}

	getEntityTagsContent() {
		if (this.props.myEntities !== null
			&& this.props.myEntities !== undefined
			&& this.props.info !== undefined
			&& this.props.info !== null
			&& this.props.info.entity_tags !== undefined) {
			const entities = this.props.myEntities
				.filter((v) => this.props.info.entity_tags.indexOf(v.id) >= 0);

			if (entities.length === 0) {
				return null;
			}

			return <div className="card-tags">
				{entities.map((v) => <Chip
					key={v.name}
					label={v.name}
				/>)}
			</div>;
		}

		return null;
	}

	render() {
		return <div className={"ArticleHorizontal card"}>
			<div className="card-horizontal">
				<div className="img-square-wrapper">
					{this.props.info.image !== null && this.props.info.image !== undefined
						? <img
							className="card-img-top"
							src={getApiURL() + "public/get_public_image/" + this.props.info.image}
							alt="Card image cap"/>
						: <NoImage/>
					}

					<div className="card-blue-boxes">
						<div className="card-blue-box">
							{this.props.info.type}
						</div>

						<div className="card-blue-box">
							{dateToString(this.props.info.publication_date, "DD MMM YYYY")}
						</div>

						{this.props.info.type === "EVENT"
							&& <div className="card-blue-box">
								START: {dateToString(this.props.info.start_date)}
							</div>
						}

						{this.props.info.type === "EVENT"
							&& <div className="card-blue-box">
								END: {dateToString(this.props.info.end_date)}
							</div>
						}
					</div>
				</div>
				<div className="card-body">
					<ArticleStatus
						status={getArticleStatus(this.props.info)}
					/>

					<h5 className="card-title">{this.props.info.title}</h5>

					{this.getEntityTagsContent()}

					<DialogArticleEditor
						trigger={<button
							className={"blue-background"}
						>
							<i className="far fa-edit"/> Open editor
						</button>}
						article={this.props.info}
						myEntities={this.props.myEntities}
						afterConfirmation={this.getMyArticles}
						settings={this.props.settings}
						afterDelete={this.props.afterDelete}
						onClose={this.props.onCloseEdition}
					/>
				</div>
			</div>
			{this.props.info.abstract !== null && this.props.info.abstract.length > 0
				&& <div className="card-text">
					<div dangerouslySetInnerHTML={{
						__html:
						dompurify.sanitize(this.props.info.abstract),
					}} />
				</div>
			}
		</div>;
	}
}
