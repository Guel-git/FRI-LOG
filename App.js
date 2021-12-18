import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TextInput } from 'react-native-gesture-handler';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

var ingredientList = []
var recipeList = [];

const Stack = createStackNavigator();

Date.prototype.format = function(f) {

  if (!this.valueOf()) return " ";
  var d = this;
  
  return f.replace(/(yyyy|mm|dd)/gi, function($1) {
      switch ($1) {
          case "yyyy": return d.getFullYear();
          case "mm": return (d.getMonth() + 1).zf(2);
          case "dd": return d.getDate().zf(2);
          default: return $1;
      }
  });
};

String.prototype.string = function(len) {var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

function HomeScreen({navigation}) {

  const [refresh, setRefresh] = useState(0);

  async function load_ingredient() {
    var valIngredient = await AsyncStorage.getItem("ingredient");
    ingredientList = JSON.parse(valIngredient);
    setRefresh(refresh+1);
  }

  async function load_recipe() {
    var valRecipe = await AsyncStorage.getItem("recipe");
    recipeList = JSON.parse(valRecipe);
    setRefresh(refresh+1);
  }

  return (
    <View style={styles.default}>
      <Text style={styles.homeTitle}>FRI-LOG</Text>
      <View style={[styles.homeListContainer, {borderTopLeftRadius: 15, borderTopRightRadius: 15 }]}>
        <Text style={styles.homeListLabel}>재료</Text>
        <FlatList 
          data={ingredientList}
          renderItem={
            load_ingredient(),
            function({ item }) {
              return (
                <View style={[styles.listContent, {marginTop: 20}]}>
                  <Text style={{fontSize: 15}}>{item.key}</Text>
                </View>
              );
            }
          }
        />
        <TouchableOpacity 
          style={styles.buttonHome}
          onPress={ function() { navigation.push('List')}}>
          <Text style={styles.buttonHomeText}>냉장고 뒤지기</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.homeListContainer, {marginTop: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, height: 280}]}>
        <Text style={styles.homeListLabel}>레시피</Text>
        <FlatList
          data={recipeList}
          renderItem={
            load_recipe(),
            function({item}){
              return (
                <View style={[styles.listContent, {marginTop: 20}]}>
                  <Text style={{fontSize: 15}}>{item.key}</Text>
                </View>
              );
            }
          }
        />
        <TouchableOpacity 
          style={styles.buttonHome}
          onPress={ function() { navigation.push('Recipe')}}>
          <Text style={styles.buttonHomeText}>레시피 뒤지기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ListScreen({ navigation }) {

  var d = new Date();
  var today = d.format("yyyy년 mm월 dd일");

  const [sel, setSel] = useState(null);
  const [extra, setExtra] = useState(null);
  const [refresh, setRefresh] = useState(0);

  async function load_data() {
    var value = await AsyncStorage.getItem("ingredient");
    ingredientList = JSON.parse(value);
    setRefresh(refresh+1);
  }

  async function save_data() {
    await AsyncStorage.setItem("ingredient", JSON.stringify(ingredientList));
  }

  return (
    <View style={styles.default}>
      <TouchableOpacity
        onPress={ function() { navigation.push('Home')}}
        style={styles.navigateButton}>
        <Text style={styles.navigateText}>◀︎ HOME</Text>
      </TouchableOpacity>
      <Text style={{marginTop: 25, fontSize: 15, color: '#585858'}}>오늘의 날짜</Text>
      <Text style={{marginTop: 5, fontSize: 23, color: '#585858', fontWeight: '700'}}>{today}</Text>
      <View style={styles.listHeadContainer}>
        <Text style={styles.listHeaderText}>재료 목록</Text>
      </View>
      <View style={styles.listConContainer}>
        <FlatList 
          data={ingredientList}
          extraData={extra}
          renderItem={ 
            load_data(),
            function({ index, item }){
              const color = (index === sel) ? '#496692' : '#585858'
              return (
                <TouchableOpacity style={styles.listContent} 
                  onPress={function () {setSel(index); setExtra(!extra);}}>
                  <Text style={{color, fontSize: 18, fontWeight: '600'}}>{item.key}</Text>
                  <Text style={{fontSize: 13, marginTop: 4}}>{item.buyDate} 구매</Text>
                  <Text style={{fontSize: 13}}>{item.eatDate} 기한</Text>
                  <Text style={{fontSize: 15, color: '#306ECB', fontWeight: '500', marginTop: 4}}>D-{item.dDay}</Text>
                </TouchableOpacity>
              );
            } 
          }
        />
      </View>
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={ function() { navigation.push('ListInput') }}>
        <Text style={styles.buttonText}>재료 채우기</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={ function() { if (sel != null) { ingredientList.splice(sel, 1); save_data()} setSel(null); setExtra(!extra); }}>
        <Text style={styles.buttonText}>재료 삭제하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function ListInputScreen({navigation}) {

  const [buyDatePickerVisible, setBuyDatePicker] = useState(false);
  const [eatDatePickerVisible, setEatDatePicker] = useState(false);
  const [name, setName] = useState("");
  const [buy, onChangeBuy] = useState("");
  const [eat, onChangeEat] = useState("");
  const [eatDate, onChangeEatDate] = useState("");

  var today = new Date();
  var gap = eatDate - today;
  var dDay = Math.ceil(gap / (1000 * 60 * 60 * 24));

  const showBuyDatePicker = () => {
    setBuyDatePicker(true);
  };

  const showEatDatePicker = () => {
    setEatDatePicker(true);
  };

  const hideBuyDatePicker = () => {
    setBuyDatePicker(false);
  };

  const hideEatDatePicker = () => {
    setEatDatePicker(false);
  };

  const handleConfirmBuy = (date) => {
    hideBuyDatePicker();
    onChangeBuy(date.format("yyyy년 mm월 dd일"));
  };

  const handleConfirmEat = (date) => {
    hideEatDatePicker();
    onChangeEat(date.format("yyyy년 mm월 dd일"));
    onChangeEatDate(date.getTime());
  };

  function add_item() {
    ingredientList.push({key: name, buyDate: buy, eatDate: eat, dDay: dDay}); 
  }

  async function save_data() {
    await AsyncStorage.setItem("ingredient", JSON.stringify(ingredientList));
  }

  function navigate() {
    navigation.push('List');
  }

  return (
    <View style={styles.default}>
      <TouchableOpacity
        onPress={ function() { navigation.push('List')}}
        style={styles.navigateButton}>
        <Text style={styles.navigateText}>◀︎ 취소</Text>
      </TouchableOpacity>
      <Text style={styles.inputTitle}>재료 추가하기</Text>
      <Text style={styles.inputLabel}>재료 이름</Text>
      <TextInput
        style={styles.textInput}
        placeholder="재료 이름"
        onChangeText={ function(t) {setName(t)}}
        placeholderTextColor="#737373"
      />
      <Text style={styles.inputLabel}>구매 날짜</Text>
      <TouchableOpacity onPress={showBuyDatePicker}>
        <TextInput
          pointerEvents="none"
          style={styles.textInput}
          placeholder="구매 날짜"
          placeholderTextColor="#737373"
          editable={false}
          value={buy}
        />
        <DateTimePickerModal
          isVisible={buyDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmBuy}
          onCancel={hideBuyDatePicker}
        />
      </TouchableOpacity>  
      <Text style={styles.inputLabel}>유통 기한</Text>
      <TouchableOpacity onPress={showEatDatePicker}>
        <TextInput
          pointerEvents="none"
          style={styles.textInput}
          placeholder="유통 기한"
          placeholderTextColor="#737373"
          editable={false}
          value={eat}
        />
        <DateTimePickerModal
          isVisible={eatDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmEat}
          onCancel={hideEatDatePicker}
        />
      </TouchableOpacity>     
      <View style={{marginTop: 30}}></View>
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={ () => {add_item(); save_data(); navigate();}}>
        <Text style={styles.buttonText}>재료 등록하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecipeScreen({ navigation }) {

  const [refresh, setRefresh] = useState(0);

  async function load_recipe() {
    var value = await AsyncStorage.getItem("recipe");
    recipeList = JSON.parse(value);
    setRefresh(refresh+1);
  }

  return (
    <View style={styles.default}>
      <TouchableOpacity
        onPress={ function() { navigation.push('Home')}}
        style={styles.navigateButton}>
        <Text style={styles.navigateText}>◀︎ HOME</Text>
      </TouchableOpacity>
      <View style={[styles.listHeadContainer, {marginTop: 40}]}>
        <Text style={styles.listHeaderText}>레시피 목록</Text>
      </View>
      <View style={[styles.listConContainer, {height: 480}]}>
        <FlatList
          data={recipeList}
          renderItem={
            load_recipe(),
            function({item}){
              return (
              <TouchableOpacity style={[styles.listContent, {marginTop: 0}]}
                onPress={function() { navigation.push('RecipeDetail', {key: item.key, content: item.content, season: item.season})}}>
                <Text style={{ marginTop: 30, fontSize: 18, fontWeight: '600'}}>{item.key}</Text>
                <Text style={{ marginTop: 10, fontSize: 15 }}>자세히 보기</Text>
              </TouchableOpacity>
              );
            }
          }
        />
      </View>
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={ function() { navigation.push('RecipeInput')}}>
        <Text style={styles.buttonText}>레시피 추가하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecipeInputScreen({ navigation }) {

  const [recipe, setRecipe] = useState("");
  const [content, setContent] = useState("");
  const [season, setSeason] = useState('proper');

  function add_item() {
    recipeList.push({key: recipe, content: content, season: season});  }

  async function save_data() {
    await AsyncStorage.setItem("recipe", JSON.stringify(recipeList));
  }

  function navigate() {
    navigation.push('Recipe');
  }

  return (
    <View style={styles.default}>
      <TouchableOpacity
        onPress={ function() { navigation.push('Recipe')}}
        style={styles.navigateButton}>
        <Text style={styles.navigateText}>◀︎ 취소</Text>
      </TouchableOpacity>
      <Text style={[styles.inputTitle, {marginTop: 30}]}>레시피 작성하기</Text>
      <Text style={styles.inputLabel}>레시피 이름</Text>
      <TextInput
        style={styles.textInput}
        placeholder="레시피 이름"
        onChangeText={ function(t) {setRecipe(t)}}
      />
      <Text style={styles.inputLabel}>레시피 내용</Text>
      <TextInput
        style={styles.textArea}
        placeholder="레시피 내용"
        numberOfLines={10}
        onChangeText={ function(t) {setContent(t)}}
        multiline={true}
      />
      <Text style={styles.inputLabel}>레시피 간</Text>
      <RadioButton.Group 
        onValueChange={value => setSeason(value)} 
        value={season}>
        <RadioButton.Item style={styles.radio} label="적당하다" value="proper" />
        <RadioButton.Item style={styles.radio} label="짜다" value="salty" />
        <RadioButton.Item style={styles.radio} label="싱겁다" value="bland" />
      </RadioButton.Group>
      <TouchableOpacity 
        style={[styles.buttonContainer, {marginTop: 25}]}
        onPress={ () => {add_item(); save_data(); navigate()}}>
        <Text style={styles.buttonText}>레시피 저장하기</Text>
      </TouchableOpacity>
    </View>
  );
}

function RecipeDetailScreen({navigation, route}) {

  var season = route.params.season;
  var seasonResult;

  if (season == 'bland') {
    seasonResult = '싱겁다';
  } else if (season == 'salty') {
    seasonResult = '짜다';
  } else {
    seasonResult = '적당하다';
  }

  async function save_data() {
    await AsyncStorage.setItem("recipe", JSON.stringify(recipeList));
  }

  return (
    <View style={styles.default}>
      <TouchableOpacity
        onPress={ function() { navigation.push('Recipe')}}
        style={styles.navigateButton}>
        <Text style={styles.navigateText}>◀︎ 뒤로가기</Text>
      </TouchableOpacity>
      <View style={[styles.listHeadContainer, {marginTop: 40}]}>
        <Text style={styles.listHeaderText}>레시피</Text>
      </View>
      <View style={[styles.listConContainer, { height: 480, padding: 25}]}>
        <Text style={{ fontSize: 18, fontWeight: '600'}}>{route.params.key}</Text>
        <Text style={{marginTop: 30, fontSize: 15, lineHeight: 25}}>{route.params.content}</Text>
        <Text style={{marginTop: 30, fontSize: 15, color: '#306ECB', fontWeight: '600'}}>{seasonResult}</Text>
      </View>
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={ function() { recipeList.splice(route.params, 1); save_data(); navigation.push('Recipe')}}>
        <Text style={styles.buttonText}>레시피 삭제하기</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Recipe" component={RecipeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecipeInput" component={RecipeInputScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="List" component={ListScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ListInput" component={ListInputScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: '#E9F2FF',
    fontFamily: 'Noto Sans',
    paddingTop: 50,
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },
  homeTitle: {
    fontWeight: 'bold',
    color: '#496692',
    fontSize: 25,
    marginTop: 60,
  },
  homeListContainer: {
    backgroundColor: '#FDFDFD',
    marginTop: 50,
    borderColor: '#737373',
    borderWidth: 2,
    width: 300,
    height: 230,
    display: 'flex',
    alignItems: 'center',
  },
  homeListLabel: {
    marginTop: 30, 
    fontSize: 18, 
    color: '#496692', 
    fontWeight: '700'
  },
  buttonHome: {
    backgroundColor: '#E9F2FF',
    width: 157,
    height: 34,
    marginBottom: 15, 
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center'
  },
  buttonHomeText: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    color: '#585858'
  },
  navigateButton: {
    alignSelf: 'flex-start', 
    marginLeft: 17, 
    marginTop: 10
  },
  navigateText: {
    fontSize: 15, 
    fontWeight: '600',
    color: '#585858',
  },
  listHeadContainer: {
    marginTop: 25,
    width: 300,
    height: 58,
    backgroundColor: '#CEE2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#737373',
    borderWidth: 2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  listHeaderText: {
    color:'#496692', 
    fontSize: 20, 
    fontWeight: '600'
  },
  listConContainer: {
    width: 300,
    height: 393,
    backgroundColor: '#FDFDFD',
    borderColor: '#737373',
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    display: 'flex',
    alignItems: 'center',
  },
  listContent: {
    color: '#585858',
    display: 'flex',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonContainer: {
    backgroundColor: '#CEE2FF',
    width: 300,
    height: 43,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#737373',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17, 
    color: "#496692", 
    fontWeight: '700'
  },
  inputTitle: {
    color:'#496692', 
    fontSize: 20, 
    fontWeight: '600', 
    marginTop: 40, 
    marginBottom: 10
  },
  inputLabel: {
    marginTop: 20, 
    fontSize: 15, 
    color: '#496692', 
    fontWeight: '600',
    paddingRight: 258,
    paddingBottom: 8
  },
  textInput: {
    fontSize: 14,
    color: '#000000',
    height: 45,
    width: 315,
    backgroundColor: '#FDFDFD',
    borderRadius: 4,
    padding: 14
  },
  textArea: {
    height: 150,
    justifyContent: 'flex-start',
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FDFDFD',
    width: 315,
    borderRadius: 4,
    paddingLeft: 14,
    paddingTop: 15
  },
  radio: {
    fontSize: 10,
    color: '#000000',
    width: 315,
    backgroundColor: '#FDFDFD',
    borderRadius: 4,
    padding: 14
  },
});