import React from "react";
import "./PageArticles.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "./box/Loading.jsx";
import { getRequest } from "../utils/request.jsx";

export default class PageArticles extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			articleEnums: null,
		};
	}

	componentDidMount() {
		this.getArticleEnums();
	}

	getArticleEnums() {
		getRequest.call(this, "public/get_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div className={"PageArticles page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-12">
						<h1>My articles</h1>

						{this.state.articleEnums !== null
							? <div>dd</div>
							: <Loading
								height={200}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
