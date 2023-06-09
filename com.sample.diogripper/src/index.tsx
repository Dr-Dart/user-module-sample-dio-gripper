/*
    BSD 3-Clause License
    Copyright (c) 2023, Doosan Robotics Inc.
*/
import { System, BaseModule, ModuleScreen, ModuleScreenProps, ModuleService } from 'dart-api';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import DigitalIO from './DigitalIO';
import DatabaseManager from './utils/DatabaseManager';
import styles from './assets/styles/styles.scss';
import { Container, CircularProgress, Box, FormControl, Select, MenuItem, Chip } from '@mui/material';

//User Command Screen, Service
import PipScreenForTaskEditor from './userCommandPIPScreen/PIPScreen';
import { ServiceForTaskEditor } from './userCommandService/UserCommandService';

// iffy for register a function to create an instance of main class which is inherited BaseModule.
(() => {
    System.registerModuleMainClassCreator((packageInfo) => new Module(packageInfo));
})();
class Module extends BaseModule {
    /*********
     * getModuleScreen
     * Select screen according to Screen componentId
     * Return Main Screen or PIP Screen
     *********/
    getModuleScreen(componentId: string) {
        console.log(`getModuleScreen: ${this.packageInfo.packageName}, ${componentId}`);
        if (componentId === 'MainScreen') {
            return MainScreen;
        } else if (componentId === 'pip_grasp') {
            return PipScreenForTaskEditor;
        } else if (componentId === 'pip_release') {
            return PipScreenForTaskEditor;
        }
        return null;
    }

    /*********
     * getModuleService
     * Select Service according to Service componentId
     * Return User Command Service
     *********/
    getModuleService(componentId: string): typeof ModuleService | null {
        console.log(`getModuleService: ${this.packageInfo.packageName}, ${componentId}`);
        return ServiceForTaskEditor;
    }
}
class MainScreen extends ModuleScreen {
    readonly context = this.moduleContext;
    constructor(props: ModuleScreenProps) {
        super(props);
        this.state = {
            indexSelected: 0,
            showProgress: false,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    async componentWillMount() {
        try {
            this.setState({
                showProgress: true,
            });
            await DatabaseManager.initDatabase(this.moduleContext);
            this.setState({
                showProgress: false,
            });
        } catch (error) {
            console.error(error);
            // handle error
        }
    }

    handleChange(event: any) {
        this.setState({
            indexSelected: event.target.value,
        });
    }
    render() {
        if (this.state.showProgress) {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                    }}
                >
                    <CircularProgress />
                </div>
            );
        } else {
            return (
                <ThemeProvider theme={this.systemTheme}>
                    <Container className={`${styles['main-container']}`}>
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box
                                style={{
                                    display: 'flex',
                                    fontSize: '2rem',
                                    height: '100%',
                                    paddingLeft: '10px',
                                    textAlign: 'center',
                                }}
                            >
                                DIO Gripper Settings
                            </Box>
                        </Box>
                        <Chip
                            label="Select Tool"
                            sx={{
                                marginTop: 3,
                            }}
                        />
                        <FormControl
                            fullWidth
                            sx={{
                                marginTop: 1,
                            }}
                        >
                            <Select
                                labelId="select-label"
                                id="select"
                                value={this.state.indexSelected}
                                onChange={this.handleChange}
                            >
                                <MenuItem value={0}>Gripper_A</MenuItem>
                                <MenuItem value={1}>Gripper_B</MenuItem>
                                <MenuItem value={2}>Gripper_C</MenuItem>
                            </Select>
                        </FormControl>
                        <DigitalIO
                            moduleContext={this.moduleContext}
                            indexSelected={this.state.indexSelected}
                        ></DigitalIO>
                    </Container>
                </ThemeProvider>
            );
        }
    }
}
