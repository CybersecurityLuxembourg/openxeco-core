import React from "react";
import "./DialogMessage.css";
import Popup from "reactjs-popup";

export default class DialogMessage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				className={"DialogMessage"}
			>
				{(close) => (
					<div className={"DialogMessage-wrapper"}>
						{this.props.text}
						<div className={"bottom-right-buttons"}>
							<button
								data-hover="Ok"
								data-active=""
								onClick={close}>
								<span><i className="far fa-check-circle"/> Ok</span>
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
