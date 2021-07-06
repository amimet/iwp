import React from "react"

export default class MainTest extends React.Component {
	setCartState = (payload) => {
		const [state, dispatch] = this.props.useGlobalState()
		dispatch({ type: "SET_CART_ITEMS", payload })
	}

	render() {
		const [ state, dispatch ] = this.props.useGlobalState()
		return <div>
			STATE:

			<div>
			{JSON.stringify(state)}
			</div>

			<div>
				<button onClick={() => this.setCartState({ mayonese: 30 })}>
					set cart
				</button>
			</div>
		</div>
	}
}