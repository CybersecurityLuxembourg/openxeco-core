import React, { Component } from "react";
import "./Communication.css";
import dompurify from "dompurify";
import Popup from "reactjs-popup";
import FormLine from "../button/FormLine.jsx";
import Chip from "../button/Chip.jsx";

export default class Communication extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<Popup
				trigger={
					<div className={"Communication"}>
						<i className="fas fa-bullhorn"/>
						<div className={"Log-name"}>
							{this.props.info.subject}
						</div>
					</div>
				}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9"}>
						<h3>{this.props.info.subject}</h3>
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
						<h3>Addresses</h3>

						{this.props.info.addresses.split(",").map((a) => <Chip
							label={a}
							key={a}
						/>)}
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
