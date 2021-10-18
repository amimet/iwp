import React from "react"
import ReactDOM from "react-dom"
import "./index.less"

const Splash = ({ props, logo }) => {
	return (
		<div className="splash_wrapper">
			<div {...props.logo} className="splash_logo">
				<img src={logo} />
			</div>
		</div>
	)
}

export default (params = {}) => {
	return {
		key: "splash",
		expose: [
			{
				attachToInitializer: [
					async (self) => {
						const fadeOutVelocity = params.velocity ?? 1000 //on milliseconds
						const splashElement = document.createElement("div")

						splashElement.style = `
                            position: absolute;
                            top: 0;
                            left: 0;

                            width: 100vw;
                            height: 100vh;
                        `

						document.body.appendChild(splashElement)
						ReactDOM.render(<Splash logo={params.logo} props={params.props} />, splashElement)

						const removeSplash = () => {
							splashElement.style.animation = `${params.preset ?? "fadeOut"} ${fadeOutVelocity ?? 1000}ms`

							setTimeout(() => {
								splashElement.remove()
							}, fadeOutVelocity ?? 1000)
						}

						self.eventBus.on("app_load_done", removeSplash)
					},
				],
			},
		],
	}
}