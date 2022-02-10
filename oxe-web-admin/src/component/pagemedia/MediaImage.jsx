import React from "react";
import "./MediaImage.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Image from "../item/Image.jsx";
import { getRequest } from "../../utils/request.jsx";
import DialogAddImage from "../dialog/DialogAddImage.jsx";
import CheckBox from "../button/CheckBox.jsx";
import { dictToURI } from "../../utils/url.jsx";
import FormLine from "../button/FormLine.jsx";

export default class MediaImage extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			images: null,
			page: 1,
			search: null,
			order: "desc",
			showLogoOnly: false,
			showLoadMoreButton: true,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(_, prevState) {
		if (prevState.showLogoOnly !== this.state.showLogoOnly
			|| prevState.order !== this.state.order
			|| (prevState.search !== this.state.search
				&& MediaImage.isSearchValid(this.state.search))) {
			this.refresh();
		}
	}

	refresh() {
		this.setState({
			images: null,
			page: 1,
		}, () => {
			this.fetchImages();
		});
	}

	fetchImages() {
		const params = {
			logo_only: this.state.showLogoOnly,
			order: this.state.order,
			page: this.state.page,
			search: this.state.search,
		};

		getRequest.call(this, "media/get_images?" + dictToURI(params), (data) => {
			this.setState({
				images: (this.state.images === null ? [] : this.state.images).concat(data.items),
				page: this.state.page + 1,
				showLoadMoreButton: data.pagination.page < data.pagination.pages,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	static isSearchValid(search) {
		return !search || search.length > 2;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="MediaImage" className="page max-sized-page">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Images</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogAddImage
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<span><i className="fas fa-plus"/></span>
									</button>
								}
								afterValidate={this.refresh}
							/>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<FormLine
							label={"Search"}
							value={this.state.search}
							onChange={(v) => this.changeState("search", v)}
							labelWidth={4}
							format={() => MediaImage.isSearchValid(this.state.search)}
						/>
					</div>
					<div className="col-md-6">
						<div className="MediaImage-buttons">
							<CheckBox
								label={"SHOW LOGO ONLY"}
								value={this.state.showLogoOnly}
								onClick={() => this.changeState("showLogoOnly", !this.state.showLogoOnly)}
							/>
							<CheckBox
								label={this.state.order === "asc" ? "OLDEST FIRST" : "NEWEST FIRST"}
								value={this.state.order !== "asc"}
								onClick={() => this.changeState(
									"order",
									this.state.order === "asc" ? "desc" : "asc",
								)}
							/>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{this.state.images === null
							&& <Loading
								height={300}
							/>
						}

						{this.state.images !== null && this.state.images.length === 0
							&& <Message
								text={"No image in the library"}
								height={300}
							/>
						}

						{this.state.images !== null && this.state.images.length !== 0
							&& <div className="row">
								{this.state.images.map((i) => i).map((i) => (
									<div
										key={"Image-" + i.id}
										className="col-md-2 col-sm-3">
										<Image
											id={i.id}
											thumbnail={i.thumbnail}
											height={i.height}
											width={i.width}
											creationDate={i.creation_date}
											afterDeletion={() => this.refresh()}
										/>
									</div>
								))}
							</div>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12 centered-buttons">
						{this.state.showLoadMoreButton
							? <button
								className={"blue-background"}
								onClick={() => this.fetchImages()}>
								<i className="fas fa-plus"/> Load more images
							</button>
							: <button
								className={"blue-background"}
								disabled={true}>
								No more image to load
							</button>
						}
					</div>
				</div>
			</div>
		);
	}
}
