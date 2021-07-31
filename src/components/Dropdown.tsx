import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TextInput,
  TextStyle,
  Image,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native'

export interface DropdownProps {
  data: Array<Selected>
  defaultValue?: number
  onSelectedChange?: (selected: Selected) => void
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  searchStyle?: StyleProp<TextStyle>
  searchCombine?: boolean
  searchPlaceholder?: string
  activeTextColor?: string
  inactiveTextColor?: string
}

type ContainerDimension = {
  width: number
  height: number
  px: number
  py: number
}

export type Selected = {
  label: string
  value: number
}

const SPACING = 10
const DEFAULT_VALUE = 0

const Dropdown = (props: DropdownProps) => {
  const {
    data,
    defaultValue,
    onSelectedChange,
    style,
    labelStyle,
    searchCombine,
    searchStyle,
    searchPlaceholder = 'Type here',
    activeTextColor = 'orange',
    inactiveTextColor = 'black',
  } = props

  const [selected, setSelected] = useState<Selected>({
    label: data[DEFAULT_VALUE].label,
    value: data[DEFAULT_VALUE].value,
  })
  const [dataDropdown, setDataDropdown] = useState<Array<Selected>>(data)
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false)
  const [containerDimension, setContainerDimension] =
    React.useState<ContainerDimension>({
      width: DEFAULT_VALUE,
      height: DEFAULT_VALUE,
      px: DEFAULT_VALUE,
      py: DEFAULT_VALUE,
    })
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false)
  const [textSearch, setTextSearch] = useState<string>(
    data[DEFAULT_VALUE].label
  )
  const containerRef = useRef<View>(null)
  const inputRef = useRef<TextInput>(null)

  const handleOnLayout = () => {
    containerRef.current?.measure((fx, fy, width, height, px, py) => {
      console.log(fx, fy, width, height, px, py)
      setContainerDimension((prev) => ({
        ...prev,
        width,
        height,
        px,
        py,
      }))
    })
  }

  const toggleDropdown = () => {
    if (searchCombine) {
      setTextSearch(selected.label)
      setIsSearchActive(!dropdownVisible)
    }
    setDropdownVisible((prev) => !prev)
  }

  const onSearch = (text: string) => {
    setTextSearch(text)
    var matchingData = data.filter((item) => item.label.search(text) != -1)
    setDataDropdown(matchingData)
  }

  const checkDefaultValue = () => {
    if (defaultValue) {
      let target = data.find((item) => item.value == defaultValue)

      if (target) {
        setSelected((prev) => ({
          ...prev,
          label: target!.label,
          value: defaultValue,
        }))
      }
    }
  }

  useEffect(() => {
    // check default value
    checkDefaultValue()
  }, [])

  const renderDropdownItem = ({
    item,
    index,
  }: {
    item: Selected
    index: number
  }) => {
    const dropdownItemView = (
      <View style={styles.dropdownItem}>
        <Text
          style={{
            color:
              selected.value == item.value
                ? activeTextColor
                : inactiveTextColor,
          }}
          children={item.label}
        />
      </View>
    )

    return (
      <TouchableOpacity
        onPress={() => {
          toggleDropdown()
          setSelected(item)
          !!onSelectedChange && onSelectedChange(item)
          searchCombine && setIsSearchActive(false)
          searchCombine && setDataDropdown(data)
        }}
        children={dropdownItemView}
      />
    )
  }

  const containerView = () => {
    const containerChild =
      searchCombine && isSearchActive ? (
        <TextInput
          ref={inputRef}
          value={textSearch}
          contextMenuHidden
          placeholder={searchPlaceholder}
          onChangeText={onSearch}
          autoFocus
          style={[styles.searchStyle, searchStyle]}
        />
      ) : (
        <Text
          style={[styles.label, labelStyle]}
          numberOfLines={1}
          children={selected.label}
        />
      )

    return (
      <View
        ref={containerRef}
        onLayout={handleOnLayout}
        style={[styles.containerStyle, style]}
      >
        {containerChild}
        <Image
          style={[
            styles.ic_arrow,
            { transform: [{ rotate: dropdownVisible ? '180deg' : '0deg' }] },
          ]}
          source={require('../assets/ic_arrow_down.png')}
        />
      </View>
    )
  }

  const dropdownWrapper = (cpn: JSX.Element) => {
    return !searchCombine ? (
      <Modal
        visible={dropdownVisible}
        transparent
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={toggleDropdown}
          children={
            <View
              style={{ flex: 1, backgroundColor: 'transparent' }}
              children={cpn}
            />
          }
        />
      </Modal>
    ) : (
      cpn
    )
  }

  const renderDropdown = () => (
    <View
      pointerEvents={dropdownVisible ? undefined : 'none'}
      style={[
        styles.dropdown,
        {
          top:
            containerDimension.height +
            5 +
            (!searchCombine ? containerDimension.py : 0),
          left: !searchCombine ? containerDimension.px : 0,
          width: containerDimension.width,
          opacity: dropdownVisible ? 1 : 0,
        },
      ]}
      children={
        <FlatList
          data={dataDropdown}
          renderItem={renderDropdownItem}
          keyExtractor={(_, index) => `${index}`}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      }
    />
  )

  return (
    <View style={{ zIndex: 5 }}>
      <TouchableWithoutFeedback
        onPress={toggleDropdown}
        children={containerView()}
      />
      {dropdownWrapper(renderDropdown())}
    </View>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    borderColor: '#CED4DA',
    borderWidth: 1,
    width: 200,
    height: 50,
    padding: SPACING,
  },
  label: {
    flex: 1,
    paddingRight: SPACING,
  },
  ic_arrow: {
    width: 12,
    height: 12,
  },
  searchStyle: {
    flex: 1,
    paddingRight: SPACING,
  },
  dropdown: {
    position: 'absolute',
    borderRadius: 5,
    maxHeight: 200,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  dropdownItem: {
    padding: SPACING,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#CED4DA',
    marginHorizontal: SPACING,
  },
})

export default Dropdown