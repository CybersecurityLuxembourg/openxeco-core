import React from "react";
import "./Campaign.css";
import dompurify from "dompurify";
import Popup from "reactjs-popup";
import Item from "./Item.jsx";
import FormLine from "../button/FormLine.jsx";

export default class Campaign extends Item {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Item Campaign"}>
						<i className="fas fa-mail-bulk"/>
						<div className={"name"}>
							{this.props.info.name || "No name"}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
			>
				{(close) => <div className="row">
					<div className={"col-md-9"}>
						<h1>
							<i className="fas fa-feather-alt"/> {this.props.name}
						</h1>
					</div>

					<div className={"col-md-3"}>
						<div className="right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Subject"}
							value={this.props.info.subject}
							disabled={true}
						/>
						<FormLine
							label={"Status"}
							value={this.props.info.status}
							disabled={true}
						/>
						<FormLine
							label={"System date"}
							value={this.props.info.sys_date}
							disabled={true}
						/>
					</div>

					<div className="col-md-12 row-spaced">
						<h3>Body</h3>

						<div dangerouslySetInnerHTML={{
							__html:
							dompurify.sanitize(this.props.info.body),
						}} />
					</div>
				</div>}
			</Popup>
		);
	}
}
