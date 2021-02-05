import React from 'react';
import './ArticleContent.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../../utils/request';
import FormLine from '../../button/FormLine';
import Loading from '../../box/Loading';
import Message from "../../box/Message";
import LogArticleVersion from "../../item/LogArticleVersion";
import DialogConfirmation from '../../dialog/DialogConfirmation';
import DialogSelectImage from '../../dialog/DialogSelectImage';
import RGL, { WidthProvider } from "react-grid-layout";
import {getApiURL} from '../../../utils/env';
const ReactGridLayout = WidthProvider(RGL);


export default class ArticleContent extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
        this.getContent = this.getContent.bind(this);
        this.moveBox = this.moveBox.bind(this);
        this.changeState = this.changeState.bind(this);
        this.updateComponent = this.updateComponent.bind(this);
        this.getItemStatusClassname = this.getItemStatusClassname.bind(this);
        this.saveContent = this.saveContent.bind(this);
        this.resizeBoxes = this.resizeBoxes.bind(this);

		this.state = {
            versions: null,
            selectedVersion: null,
			content: null,
            originalContent: null,
            logs: null,
		}
	}

	componentDidMount() {
        window.addEventListener('resize', this.resizeBoxes);
		this.refresh();
	}

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.selectedVersion !== this.state.selectedVersion &&
            this.state.selectedVersion !== null)
            this.getContent(this.state.selectedVersion)

        // Necessary to automaticaly resize the paragraph blocks

        if (JSON.stringify(prevState.content) !== JSON.stringify(this.state.content)) {
            this.resizeBoxes();
        }
    }

    refresh() {
        this.setState({
            versions: null,
            logs: null
        })

        getRequest.call(this, "article/get_article_versions/" + this.props.id, data => {
            this.setState({
                versions: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    getContent(versionId) {
        getRequest.call(this, "article/get_article_version_content/" + versionId, data => {
            for (let i in data) {
                data[i].i = i;
                data[i].y = 0;
                data[i].x = data[i].position;
                data[i].w = 1;
                data[i].h = 5;
                data[i].isResizable = true;
                data[i].draggableHandle = '.draggable';
            }

            this.setState({
                content: data,
                originalContent: data,
            }, () => {
                this.resizeBoxes()

                getRequest.call(this, "log/get_update_article_version_logs/" + versionId, data => {
                    this.setState({
                        logs: data.reverse(),
                    });
                }, response => {
                    nm.warning(response.statusText);
                }, error => {
                    nm.error(error.message);
                });
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    saveContent() {
        let params = {
            article_version_id: this.state.selectedVersion,
            content: this.state.content.sort(function(first, second) {
                return first.y - second.y;
            }),
        }

        postRequest.call(this, "article/update_article_version_content", params, response => {
            this.getContent(this.state.selectedVersion);
            nm.info("The content has been updated");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    addBox(type) {
        if (Array.isArray(this.state.content)) {
            let content = this.state.content.map(e => { return e });
            content.push({
                type: type,
                content: null,
                draggableHandle: '.draggable',
                y: 1000000,
                x: 0,
                w: 1,
                h: 5,
                position: this.state.content.length + 1,
                i: "" + this.state.content.length,
                isResizable: true,
            })

            this.setState({ content: content });
        }
    }

    moveBox(e) {
        let content = [];
        let oldBlock = null;

        for (let i = 0; i < e.length; i++) {
            oldBlock = this.state.content.filter(o => e[i].i === ("" + o.i))[0];
            content.push(Object.assign({}, oldBlock, e[i]));
        }

        this.setState({ content : content })
    }

    removeBox(i) {
        let content = this.state.content.map(c => { return c });
        content.splice(i, 1);

        for (let i in content) {
            content[i].position = parseInt(i) + 1;
            content[i].i = i + "";
        }

        this.setState({ content: content });
    }

    resizeBoxes() {
        if (this.state.content === null)
            return

        let content = this.state.content.map(c => { return c });
        let modified = false;

        content.map(c => {
            let tag = document.querySelector(".ArticleContent-layout .item-" + c.i + " .col-md-12 .FormLine")

            if (tag === null)
                return

            let newSize = Math.ceil(tag.offsetHeight + 8) / 10

            if (content[c.i].h !== newSize) {
                content[c.i].h = newSize;
                modified = true;
            }
        })

        // This way to save the new layout because the RReact Grid Layout is buggy on refreshing

        if (modified) {
            content.push({
                type: "TITLE1",
                content: null,
                draggableHandle: '.draggable',
                y: 1000000,
                x: 0,
                w: 1,
                h: 5,
                position: 1000000,
                i: "1000000",
                isResizable: true,
                fake: true
            })

            this.setState({ 
                content: content,
            }, () => {
                this.setState({ 
                    content: content.filter(c => c.fake === undefined),
                })
            })
        }
    }

    updateComponent(index, field, value) {
        let c = JSON.parse(JSON.stringify(this.state.content));
        c[index][field] = value;
        this.setState({ content : c })
    }

    getItemStatusClassname(i) {
        if (this.state.originalContent.length <= i) {
            return "ArticleContent-item-new";
        }

        if (JSON.stringify(this.state.content[i].content) !== JSON.stringify(this.state.originalContent[i].content)) {
            return "ArticleContent-item-modified";
        }

        return ""
    }

    changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		if (this.state.versions === null)
        	return <Loading height={300}/>;

		return (
            <div className={"row"}>
                <div className="col-md-12">
        			<div className={"row row-spaced"}>
                        <div className="col-md-12">
                            <h2>Content</h2>
                        </div>
        				<div className="col-md-12">
                            <FormLine
                                label={"Select version to edit"}
                                type={"select"}
                                value={this.state.selectedVersion}
                                options={[{value: null, label: "-"}].concat(
                                    this.state.versions.map(v => { return {label: v.name, value: v.id}}))}
                                onChange={v => this.changeState("selectedVersion", v)}
                            />
                        </div>
                    </div>
                    {this.state.selectedVersion !== null ?
                        this.state.content !== null ?
                            <div className={"row"}>
                                <div className="col-md-12 right-buttons">
                                    <button
                                        onClick={this.saveContent}
                                        disabled={JSON.stringify(this.state.content) === 
                                            JSON.stringify(this.state.originalContent)}>
                                        <i className="fas fa-save"/> Save content
                                    </button>
                                    <DialogConfirmation
                                        text={"Are you sure to discard changes? You will lose the current modification"}
                                        trigger={
                                            <button
                                                disabled={JSON.stringify(this.state.content) === 
                                                    JSON.stringify(this.state.originalContent)}>
                                                <i className="fas fa-undo-alt"/> Discard changes
                                            </button>
                                        }
                                        afterConfirmation={() => this.getContent(this.state.selectedVersion)}
                                    />
                                </div>
                                <div className="col-md-12">
                                    {this.state.content.length === 0 ?
                                        <Message
                                            text={"This version has no content yet"}
                                        />
                                    : ""}
                                    <ReactGridLayout
                                        className="ArticleContent-layout layout"
                                        layout={this.state.content}
                                        isDraggable={true}
                                        isResizable={false}
                                        onDragStop={(e) => this.moveBox(e)}
                                        draggableHandle={".FormLine-label"}
                                        containerPadding={[0,0]}
                                        margin={[0,0]}
                                        cols={1}
                                        rowHeight={10}
                                    >
                                        {this.state.content.map((item, index) => {
                                            return (
                                                <div className={"ArticleContent-item row item-" + index + " "
                                                    + this.getItemStatusClassname(index)}
                                                    key={index}
                                                    data-grid={item}>
                                                    <div className="ArticleContent-item-remove-button">
                                                        <span
                                                            className="tooltip--left"
                                                            data-tooltip="Remove this block"
                                                            onClick={() => this.removeBox(index)}>
                                                            <i className="fas fa-times hoverEffect pageReporting-grid-button"/>
                                                        </span>
                                                    </div>
                                                    <div className={"col-md-12"}>
                                                        {item.type === "TITLE1" ?
                                                            <FormLine
                                                                labelWidth={3}
                                                                label={item.type}
                                                                value={item.content}
                                                                onBlur={v => this.updateComponent(index, "content", v)}
                                                            />
                                                        : ""}
                                                        {item.type === "TITLE2" ?
                                                            <FormLine
                                                                labelWidth={3}
                                                                label={item.type}
                                                                value={item.content}
                                                                onBlur={v => this.updateComponent(index, "content", v)}
                                                            />
                                                        : ""}
                                                        {item.type === "PARAGRAPH" ?
                                                            <FormLine
                                                                type="editor"
                                                                label={item.type}
                                                                labelWidth={3}
                                                                value={item.content}
                                                                onChange={v => this.updateComponent(index, "content", v)}
                                                            />
                                                        : ""}
                                                        {item.type === "IMAGE" ?
                                                            <div className="ArticleContent-image-wrapper">
                                                                <FormLine
                                                                    type="image"
                                                                    label={item.type}
                                                                    labelWidth={3}
                                                                    value={item.content}
                                                                    onChange={v => this.updateComponent(index, "content", v)}
                                                                    onLoad={this.resizeBoxes}
                                                                />
                                                            </div>
                                                        : ""}
                                                        {item.type === "FRAME" ?
                                                            <FormLine
                                                                type="frame"
                                                                label={item.type}
                                                                labelWidth={3}
                                                                value={item.content}
                                                                onChange={v => this.updateComponent(index, "content", v)}
                                                            />
                                                        : ""}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </ReactGridLayout>
                                </div>
                                <div className="col-md-12 ArticleContent-block-buttons">
                                    <button
                                        onClick={() => this.addBox("TITLE1")}>
                                        <i className="fas fa-plus"/> Title 1
                                    </button>
                                    <button
                                        onClick={() => this.addBox("TITLE2")}>
                                        <i className="fas fa-plus"/> Title 2
                                    </button>
                                    <button
                                        onClick={() => this.addBox("PARAGRAPH")}>
                                        <i className="fas fa-plus"/> Paragraph
                                    </button>
                                    <button
                                        onClick={() => this.addBox("IMAGE")}>
                                        <i className="fas fa-plus"/> Image
                                    </button>
                                    <button
                                        onClick={() => this.addBox("FRAME")}>
                                        <i className="fas fa-plus"/> Frame
                                    </button>
                                </div>
                            </div>
                        : 
                            <Loading
                                height={250}
                            />
                    : ""}
                    {this.state.selectedVersion !== null ?
                        this.state.logs !== null ?
                            <div className={"row"}>
                                <div className="col-md-12">
                                    <h2>History</h2>
                                </div>
                                <div className="col-md-12">
                                    {this.state.logs.length > 0 ?
                                        this.state.logs.map((l, i) => { return (
                                            <LogArticleVersion
                                                log={l}
                                                previousLog={this.state.logs[i+1]}
                                            />
                                        )})
                                        :
                                        <Message 
                                            height={100}
                                            text={"No log in history"}
                                        />
                                    }
                                </div>
                            </div>
                        : 
                            <Loading
                                height={250}
                            />
                    : ""}
                </div>
            </div>
		);
	}
}