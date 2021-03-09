import React from "react";
import "./DialogConfirmation.css";
import Popup from "reactjs-popup";

export default class DialogConfirmation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.afterConfirmation = this.afterConfirmation.bind(this);
	}

	afterConfirmation() {
		this.props.afterConfirmation();
		document.elementFromPoint(100, 0).click();
	}

	static cancel() {
		document.elementFromPoint(100, 0).click();
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				className={"DialogConfirmation"}
			>
				<div className={"DialogConfirmation-wrapper"}>
					<h2>{this.props.text}</h2>
					<div className={"bottom-right-buttons"}>
						<button
							className={"grey-background"}
							data-hover="Cancel"
							data-active=""
							onClick={DialogConfirmation.cancel}>
							<span><i className="far fa-times-circle"/> Cancel</span>
						</button>
						<button
							data-hover="Yes"
							data-active=""
							onClick={this.afterConfirmation}>
							<span><i className="far fa-check-circle"/> Yes</span>
						</button>
					</div>
				</div>
			</Popup>
		);
	}
}
