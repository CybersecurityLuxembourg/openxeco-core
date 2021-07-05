import React, { Component } from "react";
import "./ArticleHorizontal.css";
import dompurify from "dompurify";
import { Link } from "react-router-dom";
import NoImage from "../box/NoImage.jsx";
import { getApiURL } from "../../utils/env.jsx";
import Chip from "../form/Chip.jsx";
import { dateToString } from "../../utils/date.jsx";

export default class ArticleHorizontal extends Component {
	constructor(props) {
		super(props);

		this.getBoxContent = this.getBoxContent.bind(this);
		this.getTagsContent = this.getTagsContent.bind(this);

		this.state = {
		};
	}

	getBoxContent() {
		return (
			<div className="ArticleHorizontal card">
				<div className="card-horizontal">
					<div className="img-square-wrapper">
						{this.props.info.image !== null && this.props.info.image !== undefined
							? <img
								className="card-img-top"
								src={getApiURL() + "public/get_image/" + this.props.info.image}
								alt="Card image cap"/>
							: <NoImage/>
						}
						<div className="card-date">
							{dateToString(this.props.info.publication_date, "DD MMM YYYY")}
						</div>
					</div>
					<div className="card-body">
						<h5 className="card-title">{this.props.info.title}</h5>

						{this.getTagsContent()}

						{this.props.info.link !== null
							&& this.props.info.link !== undefined
							&& this.props.info.link.length > 0
							? <button
								className={"blue-background"}
							>
								Open website
							</button>
							: <button
								className={"blue-background"}
							>
								Know more
							</button>
						}
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
			</div>
		);
	}

	getTagsContent() {
		if (this.props.analytics !== null
			&& this.props.analytics !== undefined
			&& this.props.analytics.taxonomy_values !== undefined
			&& this.props.info.taxonomy_tags !== undefined) {
			const taxonomyValues = this.props.analytics.taxonomy_values
				.filter((v) => ["ARTICLE CATEGORY", "SERVICE GROUP"].indexOf(v.category) >= 0)
				.filter((v) => this.props.info.taxonomy_tags.indexOf(v.id) >= 0)
				.sort((a, b) => (b.category < a.category ? 1 : -1));

			if (taxonomyValues.length === 0) {
				return null;
			}

			return <div className="card-tags">
				{taxonomyValues.map((v) => <Chip
					key={v.name}
					label={v.name}
					url={"/search?taxonomy_value=" + v.id}
				/>)}
			</div>;
		}

		return null;
	}

	render() {
		return this.props.info.link !== null
			&& this.props.info.link !== undefined
			&& this.props.info.link.length > 0
			? <a
				href={this.props.info.link}
				target={"_blank"}
				rel="noreferrer"
				className="ArticleHorizontal-link">
				{this.getBoxContent()}
			</a>
			: <Link to={"/news/" + this.props.info.handle} className="ArticleHorizontal-link">
				{this.getBoxContent()}
			</Link>;
	}
}
