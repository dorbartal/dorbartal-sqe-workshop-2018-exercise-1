let table = [];
let colNames = {
    line: 'Line',
    type: 'Type',
    name: 'Name',
    condition: 'Condition',
    value: 'Value'
};

const buildTable=(arg_parsedCode) => {
    table = [];
    table.push(colNames);
    let loc_body = arg_parsedCode.body;
    handleBody(loc_body);
    return table;
};

const handleBody=(body) => {
    if (body.type === 'BlockStatement')
        handleBody(body.body);
    else
        for (let i = 0; i < body.length; i++) {
            typeToHandlerMapping[body[i].type](body[i]);
            if (body[i].body)
                handleBody(body[i].body);
        }
};

const blockStat = (arg) => {
    handleBody(arg.body);
};

const varDec=(arg) => {
    arg.declarations.forEach(dec =>
        table.push({line: dec.id.loc.start.line, type: 'variable declaration', name: dec.id.name, condition: '', value: (dec.init ? dec.init.value : '')})
    );
};

//Function and arguments handlers
const funcDec=(arg) => {
    table.push({line: arg.loc.start.line, type: 'function declaration', name: arg.id.name, condition: '', value: ''});
    paramsHandle(arg.params);
};

const paramsHandle=(params) => {
    for (let i=0; i<params.length; i++)
        table.push({line: params[i].loc.start.line, type: 'variable declaration', name: params[i].name, condition: '', value: ''});
};

const forStat=(arg)=> {
    let cond = arg.init.kind + ' ' + typeToHandlerMapping[arg.init.declarations[0].id.type](arg.init.declarations[0].id) + '=' + arg.init.declarations[0].init.value+'; ';
    cond+=typeToHandlerMapping[arg.test.type](arg.test)+'; ';
    cond+=typeToHandlerMapping['UpdateExpressionValue'](arg.update);
    table.push({line: arg.test.loc.start.line , type: 'for statement', name: '', condition: cond , value: ''});
};

const ifStat=(arg, ifType) => {
    if (ifType === undefined)
        ifType = 'if statement';
    table.push({line: arg.test.loc.start.line, type: ifType, name: '', condition: typeToHandlerMapping[arg.test.type](arg.test), value:''});
    typeToHandlerMapping[arg.consequent.type](arg.consequent);
    if (arg.alternate){
        if (arg.alternate.type === 'IfStatement')
            arg.alternate.type = 'ElseIfStatement';
        else
            table.push({line: arg.alternate.loc.start.line , type:'else statement', name: '', condition:'', value:''});
        typeToHandlerMapping[arg.alternate.type](arg.alternate);
    }
};

const valueParser=(arg) => {
    return arg.type === 'BinaryExpression' ? '' + valueParser(arg.left) + ' ' + arg.operator + ' ' + valueParser(arg.right) : typeToHandlerMapping[arg.type](arg);
};

var typeToHandlerMapping = {
    'FunctionDeclaration': funcDec,
    'VariableDeclaration': varDec,
    'BlockStatement': blockStat,
    'ExpressionStatement': (arg) => {typeToHandlerMapping[arg.expression.type](arg.expression);},
    'ReturnStatement': (arg) => {table.push({line: arg.loc.start.line, type: 'return statement', name: '', condition: '', value: valueParser(arg.argument)});},
    'ForStatement': forStat,
    'WhileStatement': function whileStat(arg){table.push({line: arg.test.loc.start.line, type: 'while statement', name: '', condition: valueParser(arg.test), value: ''});},
    'IfStatement': ifStat,
    'ElseIfStatement': (arg) => {ifStat(arg, 'else if statement');},
    'Identifier': (arg)=> {return arg.name;},
    'Literal': (arg)=> {return arg.value;},
    'UpdateExpressionValue': (arg) => {return arg.prefix ? '' + arg.operator + typeToHandlerMapping[arg.argument.type](arg.argument) : '' + typeToHandlerMapping[arg.argument.type](arg.argument) + arg.operator;},
    'MemberExpression': (arg) => {return arg.property.type === 'Literal' ? '' + arg.object.name + '[' + arg.property.value + ']' : '' + arg.object.name + '[' + arg.property.name + ']';},
    'UnaryExpression': (arg) => {return arg.argument.type === 'Literal' ? '' + arg.operator + arg.argument.value : '' + arg.operator + arg.argument.name;},
    'AssignmentExpression': (arg) => {table.push({line: arg.loc.start.line, type: 'assignment expression', name: typeToHandlerMapping[arg.left.type](arg.left) , condition: '', value: typeToHandlerMapping[arg.right.type](arg.right)});},
    'UpdateExpression': (arg) => {table.push({line: arg.loc.start.line, type: 'update expression', name: typeToHandlerMapping[arg.argument.type](arg.argument) , condition: '', value: typeToHandlerMapping['UpdateExpressionValue'](arg)});},
    'BinaryExpression': (arg) => {return valueParser(arg);}
};

module.exports = {
    buildTable,
    handleBody,
    blockStat,
    varDec,
    funcDec,
    paramsHandle,
    forStat,
    ifStat,
    valueParser
};