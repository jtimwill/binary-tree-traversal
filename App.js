// Expo SVG: https://docs.expo.dev/versions/latest/sdk/svg/
// Push State Array: https://stackoverflow.com/questions/54676966/push-method-in-react-hooks-usestate
// Color Scheme: https://coolors.co/b3001b-3c91e6-587d71-4daa57-fafffd
// Reset Animation: https://stackoverflow.com/questions/51712114/how-to-reset-a-react-native-animation
// Animation Easing: https://medium.com/react-native-training/react-native-animations-using-the-animated-api-ebe8e0669fae
// Animation Scale: https://hackernoon.com/react-native-animation-guide-poz31is

import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView, Pressable, Animated, Easing } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { FontAwesome5 } from "@expo/vector-icons";
import { createTree } from "./BinaryTree";

export default function App() {
  const root = createTree();
  const [stack, setStack] = useState([]);
  const [pointer, setPointer] = useState(0);
  const [preOrderArray, setPreOrderArray] = useState([]);
  const [inOrderArray, setInOrderArray] = useState([]);
  const [postOrderArray, setPostOrderArray] = useState([]);
  const [currNode, setCurrNode] = useState(null);
  const [nodeCount, setNodeCount] = useState({});
  const [poppedNode, setPoppedNode] = useState(null);

  const preAnim = useRef(new Animated.Value(0)).current;
  const inAnim = useRef(new Animated.Value(0)).current;
  const postAnim = useRef(new Animated.Value(0)).current;
  
  const play = (animation) => {
    Animated.sequence([
      Animated.delay(750),
      Animated.timing(animation, {
        toValue: 1,
        duration: 250,
        easing: Easing.ease,
        useNativeDriver: true
      }),
    ]).start()
  }

  const traverseTree = (node, stack) => {
    if (node.type === "null") {
      stack.push(node);
      return;
    }

    stack.push(node);
    traverseTree(node.left, stack);
    stack.push(node);
    traverseTree(node.right, stack);
    stack.push(node);
  };

  const runTraversals = () => {
    const steps = [];
    traverseTree(root, steps);
    return steps;
  };

  const updateStack = () => {
    const stackCopy = [...stack];
    const currentNode = algorithmSteps[pointer];
    const nodeCountCopy = { ...nodeCount };
    const nodeStr = `${currentNode?.type}${currentNode?.id}`;

    if (nodeCountCopy[nodeStr]) {
      nodeCountCopy[nodeStr] += 1;
      while (stackCopy[stackCopy.length - 1] !== nodeStr) stackCopy.pop();
    } else {
      stackCopy.push(nodeStr);
      nodeCountCopy[nodeStr] = 1;
    }

    if (currentNode?.type !== "null") {
      if (nodeCountCopy[nodeStr] === 1) {
        setPreOrderArray([...preOrderArray, currentNode?.value]);
        play(preAnim);
      }
        
      if (nodeCountCopy[nodeStr] === 2) {
        setInOrderArray([...inOrderArray, currentNode?.value]);
        play(inAnim);
      }
        
      if (nodeCountCopy[nodeStr] === 3) {
        setPostOrderArray([...postOrderArray, currentNode?.value]);
        play(postAnim);
      }
        
    }

    if (pointer == algorithmSteps.length) {
      setPointer(0);
      setStack([]);
      setNodeCount({});
      setPreOrderArray([]);
      setInOrderArray([]);
      setPostOrderArray([]);
      setCurrNode(null);
      setPoppedNode(null);
    } else {
      setPointer(pointer + 1);
      if (stack.length > stackCopy.length)
        setPoppedNode(stack[stack.length - 1]);
      else
        setPoppedNode(null);
      setStack(stackCopy);
      setNodeCount(nodeCountCopy);
      setCurrNode(currentNode);
    }

    // console.log("Stack", stack)
    // console.log("CurrNode", currNode);
    // console.log("Stack Pointer", pointer)
    // console.log("Algorithm Steps", algorithmSteps.length)
    // console.log("nodeCount", nodeCount);
  };

  const formatNodeString = (str) => {
    const prefix = str.slice(0, 4);
    let output;
    if (prefix === "null") output = prefix;
    else output = str.slice(4);

    return "func(" + output + ")";
  };

  const algorithmSteps = runTraversals();

  const getStackUIArray = (stack, popped) => {
    if (stack.length == 0) return [];

    const stackCopy = []
    for (let i = 0; i < stack.length; ++i) {
      stackCopy.push({  text: stack[i], animation: { start: null, end: null } })
    }
    if (popped) 
      stackCopy.push({  text: popped, animation: { start: new Animated.Value(0), end: -400 }} )
    else
      stackCopy[stackCopy.length - 1].animation = { start: new Animated.Value(-400), end: 0 }

    const myAnimation = stackCopy[stackCopy.length - 1]?.animation;

    Animated.timing(myAnimation.start, {
      toValue: myAnimation.end,
      duration: 750,
      easing: Easing.bounce,
      useNativeDriver: true
    }).start();
  
    return stackCopy.reverse();
  }

  const getOutputAnimation = (arr, index, anim) => {
    return (index === arr.length - 1) && { transform: 
      [{ scale: anim }] 
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitleText, styles.shadowLight]}>
          Binary Tree Traversal
        </Text>
      </View>
      <View style={styles.graphContainer}>
        <View style={styles.treeContainer}>
          <View style={styles.treeUIContainer}>
            <SvgTree
              nodeCount={nodeCount}
              currNode={`${currNode?.type}${currNode?.id}`}
            />
          </View>
          <View style={styles.treeTitleContainer}>
            <Text style={[styles.treeTitleText, styles.shadowLight]}>
              Binary Tree
            </Text>
          </View>
        </View>
        <View style={styles.stackContainer}>
          <View style={styles.stackUIContainer}>
            <View style={[styles.stack, styles.shadow]}>
              {getStackUIArray(stack, poppedNode).map((item, index) => (
                  <Animated.View
                    style={[styles.stackElement, styles.shadowLight, 
                      item.animation.start && { transform: 
                        [{ translateY: item.animation.start }] 
                      }
                    ]
                  }
                    key={index}
                  >
                    <Text style={styles.stackElementText}>
                      {formatNodeString(item.text)}
                    </Text>
                  </Animated.View>
                ))}
            </View>
          </View>
          <View style={styles.stackTitleContainer}>
            <Text style={[styles.stackTitleText, styles.shadowLight]}>
              Stack
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.outputContainer}>
        <View style={styles.outputRowContainer}>
          <View style={styles.outputTitleContainer}>
            <Text style={[styles.outputTitleText, styles.shadowLight]}>
              Preorder
            </Text>
          </View>
          <View style={styles.outputArrayUIContainer}>
            <View style={styles.outputArray}>
              {preOrderArray.map((item, index) => (
                <Animated.View
                  style={[styles.outputArrayElement, styles.shadow, 
                    (index === preOrderArray.length - 1) && { transform: 
                      [{ scale: preAnim }] 
                    }
                  ]}
                  key={index}
                >
                  <Text style={styles.outputArrayElementText}>{item}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.outputRowContainer}>
          <View style={styles.outputTitleContainer}>
            <Text style={[styles.outputTitleText, styles.shadowLight]}>
              Inorder
            </Text>
          </View>
          <View style={styles.outputArrayUIContainer}>
            <View style={styles.outputArray}>
              {inOrderArray.map((item, index) => (
                <Animated.View
                  style={[styles.outputArrayElement, styles.shadow, 
                    (index === inOrderArray.length - 1) && { transform: 
                      [{ scale: inAnim }] 
                    }
                  ]}
                  key={index}
                >
                  <Text style={styles.outputArrayElementText}>{item}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.outputRowContainer}>
          <View style={styles.outputTitleContainer}>
            <Text style={[styles.outputTitleText, styles.shadowLight]}>
              Postorder
            </Text>
          </View>
          <View style={styles.outputArrayUIContainer}>
            <View style={styles.outputArray}>
              {postOrderArray.map((item, index) => (
                <Animated.View
                  style={[styles.outputArrayElement, styles.shadow, 
                    (index === postOrderArray.length - 1) && { transform: 
                      [{ scale: postAnim }] 
                    }
                  ]}
                  key={index}
                >
                  <Text style={styles.outputArrayElementText}>{item}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <Pressable
          onPress={updateStack}
          style={({ pressed }) => [
            styles.button,
            styles.shadow,
            pressed && styles.buttonPressed,
          ]}
        >
          <FontAwesome5 name="step-forward" size={35} color={constrastColor} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const mainColor = "#3C91E6"; // Tufts Blue
const constrastColor = "#FAFFFD"; // Baby Powder
const secondColor = "#6B0504"; // Blood Red
const thirdColor = "#4DAA57"; // Green Pantone
const fourthColor = "#B3001B"; // Fire Brick
const genericGrey = "grey";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainColor,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  headerContainer: {
    flex: 0.8,
    backgroundColor: mainColor,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
  },
  headerTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: constrastColor,
  },
  graphContainer: {
    flex: 5,
    backgroundColor: constrastColor,
    flexDirection: "row",
    borderBottomWidth: 2,
  },
  outputContainer: {
    flex: 4,
    backgroundColor: constrastColor,
  },
  footerContainer: {
    flex: 1.5,
    backgroundColor: mainColor,
  },
  treeContainer: {
    flex: 4,
    backgroundColor: constrastColor,
  },
  stackContainer: {
    flex: 2,
  },
  treeUIContainer: {
    flex: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
  treeTitleContainer: {
    flex: 1,
    borderBottomWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mainColor,
    borderRightWidth: 2,
  },
  treeTitleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: constrastColor,
  },
  stackUIContainer: {
    flex: 6,
    borderBottomWidth: 2,
  },
  stackTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mainColor,
  },
  stack: {
    flex: 1,
    borderWidth: 5,
    marginHorizontal: 15,
    marginVertical: 20,
    justifyContent: "flex-end",
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: genericGrey,
    paddingBottom: 3,
  },
  stackElement: {
    flexDirection: "row",
    borderWidth: 2,
    margin: 4,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    borderColor: constrastColor,
    backgroundColor: fourthColor,
  },
  stackElementText: {
    fontSize: 14,
    fontWeight: "bold",
    color: constrastColor,
  },
  stackTitleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: constrastColor,
  },
  outputRowContainer: {
    flex: 1,
    flexDirection: "row",
  },
  outputTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mainColor,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  outputTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: constrastColor,
    transform: [{ rotate: "-45deg" }],
  },
  outputArrayUIContainer: {
    flex: 3,
    borderBottomWidth: 2,
  },
  outputArray: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  outputArrayElement: {
    borderWidth: 2,
    margin: 5,
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: thirdColor,
  },
  outputArrayElementText: {
    fontSize: 24,
    fontWeight: "bold",
    color: constrastColor,
  },
  button: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: 25,
    backgroundColor: fourthColor,
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: constrastColor,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  buttonPressed: {
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
  },
  shadow: {
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2.5,
  },
  shadowLight: {
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2.5,
    elevation: 2.5,
  },
});

const SvgTree = ({ nodeCount, currNode }) => {
  return (
    <Svg
      width="86%"
      height="86%"
      viewBox="0 0 314 348"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={styles.shadow}
    >
        <Circle
          cx="283"
          cy="213"
          r="28.5"
          fill={nodeCount["null5"] ? thirdColor : genericGrey}
          stroke="black"
          strokeWidth={currNode === "null5" ? "6" : "3"}
          strokeDasharray="10 10"
          id="null5"
        />

      <Path
        d="M268.866 207.905L268.958 209.187C269.751 208.196 270.814 207.7 272.147 207.7C273.323 207.7 274.198 208.045 274.772 208.736C275.346 209.426 275.64 210.458 275.654 211.833V219H272.69V211.904C272.69 211.275 272.554 210.821 272.28 210.541C272.007 210.253 271.552 210.11 270.917 210.11C270.083 210.11 269.457 210.465 269.04 211.176V219H266.077V207.905H268.866ZM284.554 217.872C283.823 218.761 282.811 219.205 281.519 219.205C280.33 219.205 279.42 218.863 278.792 218.18C278.169 217.496 277.852 216.495 277.838 215.175V207.905H280.801V215.073C280.801 216.228 281.328 216.806 282.38 216.806C283.385 216.806 284.076 216.457 284.452 215.76V207.905H287.425V219H284.636L284.554 217.872ZM292.788 219H289.814V203.25H292.788V219ZM298.366 219H295.393V203.25H298.366V219Z"
        fill="white"
      />
      <Circle
        cx="252"
        cy="317"
        r="28.5"
        fill={nodeCount["null4"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "null4" ? "6" : "3"}
        strokeDasharray="10 10"
        id="null4"
      />
      <Path
        d="M237.866 311.905L237.958 313.187C238.751 312.196 239.814 311.7 241.147 311.7C242.323 311.7 243.198 312.045 243.772 312.736C244.346 313.426 244.64 314.458 244.654 315.833V323H241.69V315.904C241.69 315.275 241.554 314.821 241.28 314.541C241.007 314.253 240.552 314.11 239.917 314.11C239.083 314.11 238.457 314.465 238.04 315.176V323H235.077V311.905H237.866ZM253.554 321.872C252.823 322.761 251.811 323.205 250.519 323.205C249.33 323.205 248.42 322.863 247.792 322.18C247.169 321.496 246.852 320.495 246.838 319.175V311.905H249.801V319.073C249.801 320.228 250.328 320.806 251.38 320.806C252.385 320.806 253.076 320.457 253.452 319.76V311.905H256.425V323H253.636L253.554 321.872ZM261.788 323H258.814V307.25H261.788V323ZM267.366 323H264.393V307.25H267.366V323Z"
        fill="white"
      />
      <Circle
        cx="168"
        cy="317"
        r="28.5"
        fill={nodeCount["null3"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "null3" ? "6" : "3"}
        strokeDasharray="10 10"
        id="null3"
      />
      <Path
        d="M153.866 311.905L153.958 313.187C154.751 312.196 155.814 311.7 157.147 311.7C158.323 311.7 159.198 312.045 159.772 312.736C160.346 313.426 160.64 314.458 160.654 315.833V323H157.69V315.904C157.69 315.275 157.554 314.821 157.28 314.541C157.007 314.253 156.552 314.11 155.917 314.11C155.083 314.11 154.457 314.465 154.04 315.176V323H151.077V311.905H153.866ZM169.554 321.872C168.823 322.761 167.811 323.205 166.519 323.205C165.33 323.205 164.42 322.863 163.792 322.18C163.169 321.496 162.852 320.495 162.838 319.175V311.905H165.801V319.073C165.801 320.228 166.328 320.806 167.38 320.806C168.385 320.806 169.076 320.457 169.452 319.76V311.905H172.425V323H169.636L169.554 321.872ZM177.788 323H174.814V307.25H177.788V323ZM183.366 323H180.393V307.25H183.366V323Z"
        fill="white"
      />
      <Path
        d="M175.671 281.696C176.056 282.43 176.962 282.713 177.696 282.329L189.655 276.065C190.389 275.68 190.672 274.774 190.287 274.04C189.903 273.306 188.997 273.023 188.263 273.407L177.633 278.975L172.065 268.345C171.68 267.611 170.774 267.328 170.04 267.713C169.306 268.097 169.023 269.003 169.407 269.737L175.671 281.696ZM185.568 248.553L175.568 280.553L178.432 281.447L188.432 249.447L185.568 248.553Z"
        fill="black"
      />
      <Path
        d="M238.51 282.418C239.293 282.688 240.147 282.273 240.418 281.49L244.826 268.73C245.096 267.947 244.681 267.093 243.898 266.822C243.115 266.552 242.261 266.967 241.99 267.75L238.072 279.092L226.73 275.174C225.947 274.904 225.093 275.319 224.822 276.102C224.552 276.885 224.967 277.739 225.75 278.01L238.51 282.418ZM219.651 244.656L237.651 281.656L240.349 280.344L222.349 243.344L219.651 244.656Z"
        fill="black"
      />
      <Circle
        cx="199"
        cy="213"
        r="28.5"
        fill={nodeCount["node4"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "node4" ? "6" : "3"}
        id="node4"
      />
      <Path
        d="M203.77 217.367H206.67V221.463H203.77V227H198.689V221.463H188.195L187.967 218.264L198.637 201.406H203.77V217.367ZM193.029 217.367H198.689V208.332L198.355 208.912L193.029 217.367Z"
        fill={constrastColor}
      />
      <Circle
        cx="115"
        cy="213"
        r="28.5"
        fill={nodeCount["null2"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "null2" ? "6" : "3"}
        strokeDasharray="10 10"
        id="null2"
      />
      <Path
        d="M100.866 207.905L100.958 209.187C101.751 208.196 102.814 207.7 104.147 207.7C105.323 207.7 106.198 208.045 106.772 208.736C107.346 209.426 107.64 210.458 107.654 211.833V219H104.69V211.904C104.69 211.275 104.554 210.821 104.28 210.541C104.007 210.253 103.552 210.11 102.917 210.11C102.083 210.11 101.457 210.465 101.04 211.176V219H98.0767V207.905H100.866ZM116.554 217.872C115.823 218.761 114.811 219.205 113.519 219.205C112.33 219.205 111.42 218.863 110.792 218.18C110.169 217.496 109.852 216.495 109.838 215.175V207.905H112.801V215.073C112.801 216.228 113.328 216.806 114.38 216.806C115.385 216.806 116.076 216.457 116.452 215.76V207.905H119.425V219H116.636L116.554 217.872ZM124.788 219H121.814V203.25H124.788V219ZM130.366 219H127.393V203.25H130.366V219Z"
        fill="white"
      />
      <Circle
        cx="31"
        cy="213"
        r="28.5"
        fill={nodeCount["null1"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "null1" ? "6" : "3"}
        strokeDasharray="10 10"
        id="null1"
      />
      <Path
        d="M16.8657 207.905L16.958 209.187C17.751 208.196 18.814 207.7 20.147 207.7C21.3228 207.7 22.1978 208.045 22.772 208.736C23.3462 209.426 23.6401 210.458 23.6538 211.833V219H20.6904V211.904C20.6904 211.275 20.5537 210.821 20.2803 210.541C20.0068 210.253 19.5522 210.11 18.9165 210.11C18.0825 210.11 17.457 210.465 17.04 211.176V219H14.0767V207.905H16.8657ZM32.5542 217.872C31.8228 218.761 30.811 219.205 29.519 219.205C28.3296 219.205 27.4204 218.863 26.7915 218.18C26.1694 217.496 25.8516 216.495 25.8379 215.175V207.905H28.8013V215.073C28.8013 216.228 29.3276 216.806 30.3804 216.806C31.3853 216.806 32.0757 216.457 32.4517 215.76V207.905H35.4253V219H32.6362L32.5542 217.872ZM40.7881 219H37.8145V203.25H40.7881V219ZM46.3662 219H43.3926V203.25H46.3662V219Z"
        fill="white"
      />
      <Path
        d="M207.698 177.744C208.109 178.463 209.025 178.713 209.744 178.302L221.465 171.604C222.185 171.193 222.435 170.277 222.024 169.558C221.613 168.839 220.696 168.589 219.977 169L209.558 174.953L203.604 164.535C203.193 163.815 202.277 163.565 201.558 163.976C200.839 164.387 200.589 165.304 201 166.023L207.698 177.744ZM216.553 143.605L207.553 176.605L210.447 177.395L219.447 144.395L216.553 143.605Z"
        fill="black"
      />
      <Path
        d="M267.664 181.527C268.427 181.85 269.308 181.494 269.631 180.731L274.898 168.301C275.221 167.538 274.865 166.658 274.102 166.335C273.339 166.012 272.459 166.368 272.135 167.131L267.454 178.18L256.405 173.498C255.642 173.175 254.762 173.531 254.438 174.294C254.115 175.057 254.471 175.937 255.234 176.26L267.664 181.527ZM250.61 140.563L266.859 180.709L269.64 179.583L253.39 139.437L250.61 140.563Z"
        fill="black"
      />
      <Circle
        cx="230"
        cy="109"
        r="28.5"
        fill={nodeCount["node3"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "node3" ? "6" : "3"}
        id="node3"
      />
      <Path
        d="M227.908 107.953H230.615C231.904 107.953 232.859 107.631 233.48 106.986C234.102 106.342 234.412 105.486 234.412 104.42C234.412 103.389 234.102 102.586 233.48 102.012C232.871 101.438 232.027 101.15 230.949 101.15C229.977 101.15 229.162 101.42 228.506 101.959C227.85 102.486 227.521 103.178 227.521 104.033H222.441C222.441 102.697 222.799 101.502 223.514 100.447C224.24 99.3809 225.248 98.5488 226.537 97.9512C227.838 97.3535 229.268 97.0547 230.826 97.0547C233.533 97.0547 235.654 97.7051 237.189 99.0059C238.725 100.295 239.492 102.076 239.492 104.35C239.492 105.521 239.135 106.6 238.42 107.584C237.705 108.568 236.768 109.324 235.607 109.852C237.049 110.367 238.121 111.141 238.824 112.172C239.539 113.203 239.896 114.422 239.896 115.828C239.896 118.102 239.064 119.924 237.4 121.295C235.748 122.666 233.557 123.352 230.826 123.352C228.271 123.352 226.18 122.678 224.551 121.33C222.934 119.982 222.125 118.201 222.125 115.986H227.205C227.205 116.947 227.562 117.732 228.277 118.342C229.004 118.951 229.895 119.256 230.949 119.256C232.156 119.256 233.1 118.939 233.779 118.307C234.471 117.662 234.816 116.812 234.816 115.758C234.816 113.203 233.41 111.926 230.598 111.926H227.908V107.953Z"
        fill={constrastColor}
      />
      <Path
        d="M43.5934 177.521C43.8811 178.298 44.7441 178.694 45.521 178.407L58.1806 173.718C58.9574 173.43 59.354 172.567 59.0662 171.79C58.7785 171.013 57.9155 170.617 57.1386 170.905L45.8857 175.072L41.7179 163.819C41.4302 163.043 40.5671 162.646 39.7903 162.934C39.0134 163.221 38.6169 164.085 38.9046 164.861L43.5934 177.521ZM60.637 139.374L43.637 176.374L46.363 177.626L63.363 140.626L60.637 139.374Z"
        fill="black"
      />
      <Path
        d="M106.146 178.233C106.827 178.705 107.762 178.535 108.233 177.854L115.918 166.754C116.389 166.073 116.219 165.139 115.538 164.667C114.857 164.196 113.923 164.365 113.451 165.047L106.621 174.913L96.7542 168.082C96.0731 167.611 95.1387 167.781 94.6671 168.462C94.1956 169.143 94.3655 170.077 95.0466 170.549L106.146 178.233ZM99.5242 144.268L105.524 177.268L108.476 176.732L102.476 143.732L99.5242 144.268Z"
        fill="black"
      />
      <Circle
        cx="84"
        cy="109"
        r="28.5"
        fill={nodeCount["node2"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "node2" ? "6" : "3"}
        node="node2"
      />
      <Path
        d="M93.2832 123H75.7402V119.52L84.0195 110.695C85.1562 109.453 85.9941 108.369 86.5332 107.443C87.084 106.518 87.3594 105.639 87.3594 104.807C87.3594 103.67 87.0723 102.779 86.498 102.135C85.9238 101.479 85.1035 101.15 84.0371 101.15C82.8887 101.15 81.9805 101.549 81.3125 102.346C80.6562 103.131 80.3281 104.168 80.3281 105.457H75.2305C75.2305 103.898 75.5996 102.475 76.3379 101.186C77.0879 99.8965 78.1426 98.8887 79.5019 98.1621C80.8613 97.4238 82.4023 97.0547 84.125 97.0547C86.7617 97.0547 88.8066 97.6875 90.2598 98.9531C91.7246 100.219 92.457 102.006 92.457 104.314C92.457 105.58 92.1289 106.869 91.4726 108.182C90.8164 109.494 89.6914 111.023 88.0976 112.77L82.2793 118.904H93.2832V123Z"
        fill={constrastColor}
      />
      <Circle
        cx="157"
        cy="31"
        r="28.5"
        fill={nodeCount["node1"] ? thirdColor : genericGrey}
        stroke="black"
        strokeWidth={currNode === "node1" ? "6" : "3"}
        id="node1"
      />
      <Path
        d="M102.507 78.1409C102.584 78.9656 103.316 79.5712 104.141 79.4934L117.581 78.2254C118.406 78.1476 119.012 77.4159 118.934 76.5912C118.856 75.7664 118.124 75.1609 117.299 75.2387L105.352 76.3657L104.225 64.4188C104.148 63.594 103.416 62.9885 102.591 63.0663C101.766 63.1441 101.161 63.8758 101.239 64.7006L102.507 78.1409ZM126.844 48.0436L102.844 77.0436L105.156 78.9564L129.156 49.9564L126.844 48.0436Z"
        fill="black"
      />
      <Path
        d="M210.178 79.019C211.004 79.0851 211.727 78.4692 211.793 77.6434L212.87 64.1864C212.936 63.3606 212.32 62.6376 211.494 62.5716C210.668 62.5055 209.945 63.1214 209.879 63.9472L208.922 75.9089L196.961 74.952C196.135 74.8859 195.412 75.5018 195.346 76.3276C195.28 77.1534 195.896 77.8764 196.721 77.9424L210.178 79.019ZM184.858 49.9727L209.156 78.4965L211.44 76.5511L187.142 48.0273L184.858 49.9727Z"
        fill="black"
      />
      <Path
        d="M160.08 44H155V24.418L148.936 26.2988V22.168L159.535 18.3711H160.08V44Z"
        fill={constrastColor}
      />
    </Svg>
  );
};
