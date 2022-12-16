import React from "react";
import "./LogArticleVersion.css";
import Popup from "reactjs-popup";
import dompurify from "dompurify";
import FormLine from "../button/FormLine.jsx";
import Message from "../box/Message.jsx";
import { getApiURL } from "../../utils/env.jsx";
import Item from "./Item.jsx";

export default class LogArticleVersion extends Item {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);

		this.state = {
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false });
	}

	onOpen() {
		this.setState({ isDetailOpened: true });
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<div className={"Item LogArticleVersion"}>
						<i className="fas fa-history"/>
						<div className={"name"}>
							{this.props.log !== undefined && this.props.log !== null
								? "Log " + this.props.log.sys_date
								: "Unfound log"
							}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				<div className="row">
					<div className="col-md-12">
						<h2>
							<i className="fas fa-history"/>&nbsp;
							{this.props.log !== undefined && this.props.log !== null
								? "Log " + this.props.log.sys_date
								: "Unfound log"
							}
						</h2>
					</div>
					<div className="col-md-6">
						<h3>Previous version</h3>
						{this.props.previousLog !== undefined && this.props.previousLog !== null
							? <div>
								<FormLine
									fullWidth={true}
									label={"Time"}
									value={this.props.previousLog.sys_date}
									disabled={true}
								/>
								<FormLine
									fullWidth={true}
									label={"User"}
									value={this.props.previousLog.user_id}
									disabled={true}
								/>
								{JSON.parse(this.props.previousLog.params).content.map((item) => (
									<div key={item.id}>
										{item.type === "TITLE1"
											? <h4>{item.content}</h4>
											: ""}
										{item.type === "TITLE2"
											? <h5>{item.content}</h5>
											: ""}
										{item.type === "TITLE3"
											? <h6>{item.content}</h6>
											: ""}
										{item.type === "PARAGRAPH"
											? <div>
												<div
													dangerouslySetInnerHTML={{
														__html: dompurify.sanitize(item.content),
													}}>
												</div>
											</div>
											: ""}
										{item.type === "IMAGE"
											? <div>
												<img
													className={"LogArticleVersion-image"}
													src={getApiURL() + "public/get_public_image/" + item.content}
												/>
											</div>
											: ""}
									</div>
								))}
							</div>
							: <Message
								height={180}
								text={"No previous log"}
							/>
						}
					</div>
					<div className="col-md-6">
						<h3>Current version</h3>
						{this.props.log !== undefined && this.props.log !== null
							? <div>
								<FormLine
									fullWidth={true}
									label={"Time"}
									value={this.props.log.sys_date}
									disabled={true}
								/>
								<FormLine
									fullWidth={true}
									label={"User"}
									value={this.props.log.user_id}
									disabled={true}
								/>
								{JSON.parse(this.props.log.params).content.map((item) => (
									<div key={item.id}>
										{item.type === "TITLE1"
											? <h4>{item.content}</h4>
											: ""}
										{item.type === "TITLE2"
											? <h5>{item.content}</h5>
											: ""}
										{item.type === "TITLE3"
											? <h6>{item.content}</h6>
											: ""}
										{item.type === "PARAGRAPH"
											? <div>
												<div
													dangerouslySetInnerHTML={{
														__html: dompurify.sanitize(item.content),
													}}>
												</div>
											</div>
											: ""}
										{item.type === "IMAGE"
											? <div>
												<img
													className={"LogArticleVersion-image"}
													src={getApiURL() + "public/get_public_image/" + item.content}
												/>
											</div>
											: ""}
									</div>
								))}
							</div>
							: <Message
								height={180}
								text={"Unfound log"}
							/>
						}
					</div>
				</div>
			</Popup>
		);
	}
}
