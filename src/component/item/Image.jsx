import React, { Component } from "react";
import "./Image.css";
import Popup from "reactjs-popup";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import { getApiURL } from "../../utils/env.jsx";

export default class Image extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);

		this.state = {
			isDetailOpened: false,
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
				className="Popup-full-size"
				trigger={
					<div className={"Image " + (this.props.selected ? "Image-selected" : "")}>
						<div className={"Image-image"}>
							<img src={"data:image/jpeg;base64, " + this.props.thumbnail}/>
						</div>
						<div className={"Image-text"}>
							{this.props.width} x {this.props.height}
						</div>
						<div className={"Image-text"}>
							{this.props.creationDate}
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
						<h1 className="Image-title">
                            Image
						</h1>

						{this.state.user !== null
							? <div>
								<div className={"Image-image"}>
									<img src={getApiURL() + "public/get_image/" + this.props.id}/>
								</div>
								<FormLine
									label={"Width"}
									value={this.props.width}
									disabled={true}
								/>
								<FormLine
									label={"Height"}
									value={this.props.height}
									disabled={true}
								/>
								<FormLine
									label={"Creation date"}
									value={this.props.creationDate}
									disabled={true}
								/>
							</div>
							: <Loading/>
						}
					</div>
				</div>
			</Popup>
		);
	}
}
