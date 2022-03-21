import React, { Component } from "react";
import "./Request.css";
import { NotificationManager as nm } from "react-notifications";
import dompurify from "dompurify";
import { postRequest } from "../../utils/request.jsx";

export default class Request extends Component {
	constructor(props) {
		super(props);

		this.delete = this.delete.bind(this);

		this.state = {
		};
	}

	delete() {
		const params = {
			id: this.props.info.id,
		};

		postRequest.call(this, "private/delete_my_request", params, () => {
			if (this.props.afterDelete !== undefined) {
				this.props.afterDelete();
			}

			nm.info("The request has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	static getPrettyRequestContent(input) {
		let output = "";

		Object.keys(input).map((k) => {
			output += k + ": " + input[k] + "<br/>";
			return "";
		});

		return dompurify.sanitize(
			output,
		);
	}

	render() {
		return (
			<div className="Request card">
				<div className="card-horizontal">
					<div className="card-body">
						<div className="card-date">
							{this.props.info.submission_date
								? this.props.info.submission_date.replace("T", " ")
								: "NO DATE FOUND"
							}
						</div>

						<div className="card-type">
							STATUS: {this.props.info.status}
						</div>

						{this.props.info.type !== null
							? <div>
								<b>{this.props.info.type}</b>
							</div>
							: ""
						}

						{this.props.info.request !== null
							? <p className="card-text">
								{this.props.info.request}
							</p>
							: ""
						}

						{this.props.info.data !== null
							&& typeof this.props.info.data === "object"
							&& !Array.isArray(this.props.info.data)
							? <div dangerouslySetInnerHTML={
								{
									__html:
									Request.getPrettyRequestContent(this.props.info.data),
								}
							}/>
							: ""
						}

						{this.props.info.image !== null
							? <div>
								<img src={"data:image/png;base64," + this.props.info.image} />
							</div>
							: ""
						}

						{this.props.info.status === "NEW"
							&& <button
								className={"red-background"}
								onClick={this.delete}
								disabled={this.props.info.link === null}
							>
								<i className="fas fa-trash-alt"/> Delete
							</button>
						}
					</div>
				</div>
			</div>
		);
	}
}
